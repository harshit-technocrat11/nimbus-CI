import { Router } from "express";
import { githubWebhookController } from "../controllers/github-webhook.controller.js";

const router: Router = Router();

router.post("/webhooks/github", githubWebhookController);

export default router;

