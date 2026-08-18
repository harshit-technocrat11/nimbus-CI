import {prisma}    from "@nimbus-ci/db"
import type { CreateWorkflowInput } from "../schemas/workflow.schema.js"

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