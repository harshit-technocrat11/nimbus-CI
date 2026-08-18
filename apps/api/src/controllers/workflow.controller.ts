import { Request, Response } from "express";

import {
  createWorkflow,
  getWorkflowById,
  getWorkflowsByRepository,
} from "../services/workflow.service.js";

import { logger } from "@nimbus-ci/logger";

export const createWorkflowController = async (
  req: Request,
  res: Response
) => {
  try {
    const { repositoryId } = req.params;

    const workflow = await createWorkflow(
      repositoryId,
      req.body
    );

    logger.info(`Workflow created: ${workflow.id}`);

    return res.status(201).json(workflow);
  } catch (error) {
    logger.error("Failed to create workflow", { error });

    return res.status(500).json({
      message: "Failed to create workflow",
    });
  }
};

export const getWorkflowsController = async (
  req: Request,
  res: Response
) => {
  try {
    const workflows = await getWorkflowsByRepository(
      req.params.repositoryId
    );

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
    const workflow = await getWorkflowById(req.params.id);

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