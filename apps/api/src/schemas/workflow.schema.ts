import { z } from "zod";

export const workflowJobSchema = z.object({
  name: z.string().min(1),

  commands: z
    .array(z.string().min(1))
    .min(1),
});

export const createWorkflowSchema = z.object({
  name: z.string().min(1).max(100),

  jobs: z
    .array(workflowJobSchema)
    .min(1),
});

export type CreateWorkflowInput = z.infer<
  typeof createWorkflowSchema
>;