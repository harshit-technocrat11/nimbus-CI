import { Request, Response } from "express";

import {
  createWorkflowRun,
  getWorkflowRun,
  getWorkflowRuns,
  getJobsForRun,
  getJobLogs,
} from "../services/workflow-run.service";

import { logger } from "@repo/logger";

export const createWorkflowRunController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workflowId } = req.params;

    const run = await createWorkflowRun(
      workflowId,
      req.body.commitSha
    );

    logger.info(`Workflow run created: ${run?.id}`);

    return res.status(201).json(run);
  } catch (error) {
    logger.error("Failed to create workflow run", { error });

    if (
      error instanceof Error &&
      error.message === "Workflow not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to create workflow run",
    });
  }
};

export const getWorkflowRunController = async (
  req: Request,
  res: Response
) => {
  try {
    const run = await getWorkflowRun(req.params.id);

    if (!run) {
      return res.status(404).json({
        message: "Workflow run not found",
      });
    }

    return res.json(run);
  } catch (error) {
    logger.error("Failed to fetch workflow run", { error });

    return res.status(500).json({
      message: "Failed to fetch workflow run",
    });
  }
};

export const getWorkflowRunsController = async (
  req: Request,
  res: Response
) => {
  try {
    const runs = await getWorkflowRuns(
      req.params.workflowId
    );

    return res.json(runs);
  } catch (error) {
    logger.error("Failed to fetch workflow runs", { error });

    return res.status(500).json({
      message: "Failed to fetch workflow runs",
    });
  }
};

export const getJobsController = async (
  req: Request,
  res: Response
) => {
  try {
    const jobs = await getJobsForRun(
      req.params.runId
    );

    return res.json(jobs);
  } catch (error) {
    logger.error("Failed to fetch jobs", { error });

    return res.status(500).json({
      message: "Failed to fetch jobs",
    });
  }
};

export const getJobLogsController = async (
  req: Request,
  res: Response
) => {
  try {
    const logs = await getJobLogs(
      req.params.jobId
    );

    return res.json(logs);
  } catch (error) {
    logger.error("Failed to fetch job logs", { error });

    return res.status(500).json({
      message: "Failed to fetch job logs",
    });
  }
};