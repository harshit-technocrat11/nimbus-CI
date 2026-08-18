import { z } from "zod";

export const createWorkflowRunSchema = z.object({
  commitSha: z
    .string()
    .min(1)
    .optional(),
});

export type CreateWorkflowRunInput = z.infer<
  typeof createWorkflowRunSchema
>;