import { z } from "zod";

export const createWorkflowRunSchema = z.object({
  commitSha: z.string().trim().min(1, "Commit SHA cannot be empty").optional(),
  branch: z.string().trim().min(1).default("main"),
});

export type CreateWorkflowRunInput = z.infer<typeof createWorkflowRunSchema>;