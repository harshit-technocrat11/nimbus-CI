import type { Request, Response } from "express";
import {
  createWorkflowRun,
  getWorkflowRun,
  getWorkflowRuns,
  getJobsForRun,
  getJobLogs,
} from "../services/workflow-run.service.js";
import { getParam } from "../utils/params.js";
import { logger } from "@nimbus-ci/logger";

export const createWorkflowRunController = async (
  req: Request,
  res: Response
) => {
  try {
    const workflowId = getParam(req.params.workflowId);
    if (!workflowId) {
      return res.status(400).json({ message: "Workflow ID is required" });
    }

    const run = await createWorkflowRun(workflowId, req.body);

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
    const id = getParam(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Workflow run ID is required" });
    }

    const run = await getWorkflowRun(id);

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
    const workflowId = getParam(req.params.workflowId);
    if (!workflowId) {
      return res.status(400).json({ message: "Workflow ID is required" });
    }

    const runs = await getWorkflowRuns(workflowId);

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
    const runId = getParam(req.params.runId);
    if (!runId) {
      return res.status(400).json({ message: "Run ID is required" });
    }

    const jobs = await getJobsForRun(runId);

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
    const jobId = getParam(req.params.jobId);
    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    const logs = await getJobLogs(jobId);

    return res.json(logs);
  } catch (error) {
    logger.error("Failed to fetch job logs", { error });

    return res.status(500).json({
      message: "Failed to fetch job logs",
    });
  }
};