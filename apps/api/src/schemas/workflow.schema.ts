import { z } from "zod";

export const workflowJobSchema = z.object({
  name: z.string().trim().min(1, "Job name is required"),
  commands: z
    .array(z.string().trim().min(1, "Command cannot be empty"))
    .min(1, "At least one command is required"),
});

export const createWorkflowSchema = z.object({
  name: z.string().trim().min(1, "Workflow name is required").max(100),
  jobs: z
    .array(workflowJobSchema)
    .min(1, "At least one job is required in workflow definition"),
});

export type WorkflowJobInput = z.infer<typeof workflowJobSchema>;
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;