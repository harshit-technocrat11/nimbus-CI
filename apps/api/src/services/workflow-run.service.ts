import {prisma } from "@nimbus-ci/db"

export const createWorkflowRun = async (
  workflowId: string,
  commitSha?: string
) => {
  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  const definition = workflow.definition as Array<{
    name: string;
    commands: string[];
  }>;

  return prisma.$transaction(async (tx) => {
    const run = await tx.workflowRun.create({
      data: {
        workflowId,
        commitSha,
        status: "QUEUED",
      },
    });

    for (const job of definition) {
      await tx.job.create({
        data: {
          workflowRunId: run.id,
          name: job.name,
          commands: job.commands,
          status: "PENDING",
        },
      });
    }

    return tx.workflowRun.findUnique({
      where: {
        id: run.id,
      },
      include: {
        jobs: true,
      },
    });
  });
};

export const getWorkflowRun = async (id: string) => {
  return prisma.workflowRun.findUnique({
    where: {
      id,
    },
    include: {
      workflow: true,
      jobs: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
};

export const getWorkflowRuns = async (
  workflowId: string
) => {
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

export const getJobsForRun = async (
  workflowRunId: string
) => {
  return prisma.job.findMany({
    where: {
      workflowRunId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const getJobLogs = async (
  jobId: string
) => {
  return prisma.jobLog.findMany({
    where: {
      jobId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};