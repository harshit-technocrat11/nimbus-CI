import { z } from "zod";

export const createRepositorySchema = z
  .object({
    name: z.string().trim().min(1, "Repository name is required").max(100),
    owner: z.string().trim().min(1, "Owner is required").optional(),
    url: z.string().trim().url("Repository URL must be a valid URL").optional(),
    githubUrl: z.string().trim().url("GitHub URL must be a valid URL").optional(),
    defaultBranch: z.string().trim().min(1).default("main"),
  })
  .refine((data) => Boolean(data.url || data.githubUrl), {
    message: "Either 'url' or 'githubUrl' must be provided",
    path: ["url"],
  });

export type CreateRepositoryInput = z.infer<typeof createRepositorySchema>;