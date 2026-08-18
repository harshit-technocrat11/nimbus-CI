import { Router } from "express";
import {
  createRepositoryController,
  getRepositoriesController,
  getRepositoryController,
} from "../controllers/repository.controller.js";
import { validateBody } from "../middlewares/validate.js";
import { createRepositorySchema } from "../schemas/repository.schema.js";

const router: Router = Router();

router.post(
  "/",
  validateBody(createRepositorySchema),
  createRepositoryController
);

router.get("/", getRepositoriesController);
router.get("/:id", getRepositoryController);

export default router;