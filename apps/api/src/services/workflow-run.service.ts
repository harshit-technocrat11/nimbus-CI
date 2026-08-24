import { prisma } from "@nimbus-ci/db";
import { ciQueue } from "@nimbus-ci/queue";
import { logger } from "@nimbus-ci/logger";
import type { CreateWorkflowRunInput } from "../schemas/workflow-run.schema.js";

export const createWorkflowRun = async (
  workflowId: string,
  input?: CreateWorkflowRunInput
) => {
  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
    },
    include: {
      repository: true,
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  const rawDefinition = workflow.definition;
  const definition = (
    Array.isArray(rawDefinition)
      ? rawDefinition
      : (rawDefinition as any)?.jobs ?? []
  ) as Array<{
    name: string;
    image?: string;
    commands?: string[];
    steps?: string[];
  }>;

  const branch = input?.branch || workflow.repository.defaultBranch || "main";
  const commitSha = input?.commitSha ?? null;

  const run = await prisma.$transaction(async (tx) => {
    const newRun = await tx.workflowRun.create({
      data: {
        workflowId,
        branch,
        commitSha,
        status: "QUEUED",
      },
    });

    for (const job of definition) {
      const steps = job.steps ?? job.commands ?? [];
      const image = job.image ?? "node:22";

      const createdJob = await tx.job.create({
        data: {
          workflowRunId: newRun.id,
          name: job.name,
          commands: steps,
          status: "QUEUED",
        },
      });

      // Enqueue job execution
      try {
        await ciQueue.add("run-ci-job", {
          jobId: createdJob.id,
          workflowRunId: newRun.id,
          repoUrl: workflow.repository.url,
          commitSha: commitSha ?? "HEAD",
          branch,
          image,
          steps,
          commands: steps,
        });
      } catch (err) {
        logger.error("Failed to enqueue job to ciQueue", {
          error: err,
          jobId: createdJob.id,
        });
      }
    }

    return tx.workflowRun.findUnique({
      where: {
        id: newRun.id,
      },
      include: {
        jobs: true,
      },
    });
  });

  return run;
};

export const getWorkflowRun = async (id: string) => {
  return prisma.workflowRun.findUnique({
    where: {
      id,
    },
    include: {
      workflow: {
        include: {
          repository: true,
        },
      },
      jobs: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
};

export const getWorkflowRuns = async (workflowId: string) => {
  return prisma.workflowRun.findMany({
    where: {
      workflowId,
    },
    include: {
      jobs: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getJobsForRun = async (workflowRunId: string) => {
  return prisma.job.findMany({
    where: {
      workflowRunId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const getJobLogs = async (jobId: string) => {
  return prisma.jobLog.findMany({
    where: {
      jobId,
    },
    orderBy: {
      sequence: "asc",
    },
  });
};