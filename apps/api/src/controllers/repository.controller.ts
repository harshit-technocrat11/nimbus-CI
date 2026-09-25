import type { Request, Response } from "express";
import {
  createRepository,
  getRepositories,
  getRepositoryById,
} from "../services/repository/repository.service.js";
import { getParam } from "../utils/params.js";
import { logger } from "@nimbus-ci/logger";

export const createRepositoryController = async (
  req: Request,
  res: Response,
) => {
  try {
    const repository = await createRepository(req.body);

    logger.info(`Repository created: ${repository.id}`);

    return res.status(201).json(repository);
  } catch (error) {
    logger.error("Failed to create repository", { error });

    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to create repository",
    });
  }
};

export const getRepositoriesController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const repositories = await getRepositories();

    return res.json(repositories);
  } catch (error) {
    logger.error("Failed to fetch repositories", { error });

    return res.status(500).json({
      message: "Failed to fetch repositories",
    });
  }
};

export const getRepositoryController = async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Repository ID is required" });
    }

    const repository = await getRepositoryById(id);

    if (!repository) {
      return res.status(404).json({
        message: "Repository not found",
      });
    }

    return res.json(repository);
  } catch (error) {
    logger.error("Failed to fetch repository", { error });

    return res.status(500).json({
      message: "Failed to fetch repository",
    });
  }
};
