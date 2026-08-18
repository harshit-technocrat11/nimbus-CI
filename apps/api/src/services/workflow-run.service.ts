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

  const definition = (workflow.definition ?? []) as Array<{
    name: string;
    commands: string[];
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
      const createdJob = await tx.job.create({
        data: {
          workflowRunId: newRun.id,
          name: job.name,
          commands: job.commands,
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
          commands: job.commands,
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