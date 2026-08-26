import { prisma } from "@nimbus-ci/db";
import type { CreateRepositoryInput } from "../../schemas/repository.schema.js";

export const createRepository = async (data: CreateRepositoryInput) => {
  const repoUrl = data.url ?? data.githubUrl!;
  let owner = data.owner;

  if (!owner) {
    try {
      const parsed = new URL(repoUrl);
      const pathParts = parsed.pathname.replace(/^\/|\/$/g, "").split("/");
      if (pathParts.length >= 2 && pathParts[0]) {
        owner = pathParts[0];
      } else {
        owner = "unknown";
      }
    } catch {
      owner = "unknown";
    }
  }

  return prisma.repository.create({
    data: {
      name: data.name,
      owner,
      url: repoUrl,
      defaultBranch: data.defaultBranch ?? "main",
    },
  });
};

export const getRepositories = async () => {
  return prisma.repository.findMany({
    include: {
      workflows: {
        include: {
          runs: {
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getRepositoryById = async (id: string) => {
  return prisma.repository.findUnique({
    where: { id },
    include: {
      workflows: {
        include: {
          runs: {
            take: 5,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });
};

export const getRepositoryByUrl = async (url: string) => {
  return prisma.repository.findUnique({
    where: { url },
    include: {
      workflows: {
        include: {
          runs: {
            take: 5,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });
};
