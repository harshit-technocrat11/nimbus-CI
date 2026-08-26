import { prisma, type WorkflowRunStatus, type TriggerType } from "@nimbus-ci/db";

export interface CreatePipelineInput {
  workflowId: string;
  branch: string;
  commitSha?: string | null;
  triggerType?: TriggerType;
}

export const createPipeline = async (input: CreatePipelineInput) => {
  return prisma.workflowRun.create({
    data: {
      workflowId: input.workflowId,
      branch: input.branch,
      commitSha: input.commitSha ?? null,
      status: "QUEUED",
      triggerType: input.triggerType ?? "MANUAL",
    },
  });
};

export const getPipeline = async (id: string) => {
  return prisma.workflowRun.findUnique({
    where: { id },
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

export const getPipelinesByWorkflow = async (workflowId: string) => {
  return prisma.workflowRun.findMany({
    where: { workflowId },
    include: {
      jobs: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updatePipelineStatus = async (
  id: string,
  status: WorkflowRunStatus,
  options?: {
    startedAt?: Date;
    completedAt?: Date;
    errorMessage?: string | null;
  }
) => {
  return prisma.workflowRun.update({
    where: { id },
    data: {
      status,
      ...(options?.startedAt && { startedAt: options.startedAt }),
      ...(options?.completedAt && { completedAt: options.completedAt }),
      ...(options?.errorMessage !== undefined && { errorMessage: options.errorMessage }),
    },
  });
};
