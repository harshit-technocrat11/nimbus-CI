import { Router } from "express";
import {
  createWorkflowRunController,
  getAllWorkflowRunsController,
  getWorkflowRunController,
  getWorkflowRunsController,
  getJobsController,
  getJobLogsController,
} from "../controllers/workflow-run.controller.js";
import { validateBody } from "../middlewares/validate.js";
import { createWorkflowRunSchema } from "../schemas/workflow-run.schema.js";

const router: Router = Router();

router.post(
  "/workflows/:workflowId/runs",
  validateBody(createWorkflowRunSchema),
  createWorkflowRunController,
);

router.get("/workflows/:workflowId/runs", getWorkflowRunsController);

router.get("/runs", getAllWorkflowRunsController);

router.get("/runs/:id", getWorkflowRunController);

router.get("/runs/:runId/jobs", getJobsController);

router.get("/jobs/:jobId/logs", getJobLogsController);

export default router;
