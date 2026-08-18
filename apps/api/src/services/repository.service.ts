import { prisma } from "@nimbus-ci/db";
import type { CreateRepositoryInput } from "../schemas/repository.schema";

export const createRepository = async (
  data: CreateRepositoryInput
) => {
  return prisma.repository.create({
    data: {
      name: data.name,
      githubUrl: data.githubUrl,
    },
  });
};

export const getRepositories = async () => {
  return prisma.repository.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getRepositoryById = async (id: string) => {
  return prisma.repository.findUnique({
    where: { id },
  });
};