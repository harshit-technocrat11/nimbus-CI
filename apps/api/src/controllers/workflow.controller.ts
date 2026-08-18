import type { Request, Response } from "express";
import {
  createWorkflow,
  getWorkflowById,
  getWorkflowsByRepository,
} from "../services/workflow.service.js";
import { getParam } from "../utils/params.js";
import { logger } from "@nimbus-ci/logger";

export const createWorkflowController = async (
  req: Request,
  res: Response
) => {
  try {
    const repositoryId = getParam(req.params.repositoryId);
    if (!repositoryId) {
      return res.status(400).json({ message: "Repository ID is required" });
    }

    const workflow = await createWorkflow(repositoryId, req.body);

    logger.info(`Workflow created: ${workflow.id}`);

    return res.status(201).json(workflow);
  } catch (error) {
    logger.error("Failed to create workflow", { error });

    return res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to create workflow",
    });
  }
};

export const getWorkflowsController = async (
  req: Request,
  res: Response
) => {
  try {
    const repositoryId = getParam(req.params.repositoryId);
    if (!repositoryId) {
      return res.status(400).json({ message: "Repository ID is required" });
    }

    const workflows = await getWorkflowsByRepository(repositoryId);

    return res.json(workflows);
  } catch (error) {
    logger.error("Failed to fetch workflows", { error });

    return res.status(500).json({
      message: "Failed to fetch workflows",
    });
  }
};

export const getWorkflowController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = getParam(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Workflow ID is required" });
    }

    const workflow = await getWorkflowById(id);

    if (!workflow) {
      return res.status(404).json({
        message: "Workflow not found",
      });
    }

    return res.json(workflow);
  } catch (error) {
    logger.error("Failed to fetch workflow", { error });

    return res.status(500).json({
      message: "Failed to fetch workflow",
    });
  }
};