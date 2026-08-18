import { prisma } from "@nimbus-ci/db";
import type { CreateWorkflowInput } from "../schemas/workflow.schema.js";

export const createWorkflow = async (
  repositoryId: string,
  data: CreateWorkflowInput
) => {
  return prisma.workflow.create({
    data: {
      name: data.name,
      definition: data.jobs,
      repositoryId,
    },
  });
};

export const getWorkflowsByRepository = async (repositoryId: string) => {
  return prisma.workflow.findMany({
    where: {
      repositoryId,
    },
    include: {
      runs: {
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getWorkflowById = async (id: string) => {
  return prisma.workflow.findUnique({
    where: {
      id,
    },
    include: {
      repository: true,
      runs: {
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
};