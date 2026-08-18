import { Router } from "express";

import {
  createWorkflowController,
  getWorkflowController,
  getWorkflowsController,
} from "../controllers/workflow.controller.js";

import { validateBody } from "../middleware/validate.js";
import { createWorkflowSchema } from "../schemas/workflow.schema.js";

const router = Router();

router.post(
  "/repositories/:repositoryId/workflows",
  validateBody(createWorkflowSchema),
  createWorkflowController
);

router.get(
  "/repositories/:repositoryId/workflows",
  getWorkflowsController
);

router.get(
  "/workflows/:id",
  getWorkflowController
);

export default router;