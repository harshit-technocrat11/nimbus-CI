import { z } from "zod";

export const createRepositorySchema = z.object({
  name: z.string().min(1).max(100),

  githubUrl: z.string().url(),
});

export type CreateRepositoryInput = z.infer<
  typeof createRepositorySchema
>;