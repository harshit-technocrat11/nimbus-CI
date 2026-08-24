import type { Request, Response, NextFunction } from "express";
import { prisma } from "@nimbus-ci/db";
import { createWorkflowRun } from "../services/workflow-run.service.js";

export const githubWebhookController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = req.headers["x-github-event"];

    console.log("[github] event:", event);

    // For now, only handle push events
    if (event !== "push") {
      return res.status(200).json({
        received: true,
        ignored: true,
      });
    }

    const payload = req.body;

    const repository = payload.repository;
    const branch = payload.ref?.replace("refs/heads/", "");
    const commitSha = payload.after;

    if (!repository?.clone_url || !branch || !commitSha) {
      return res.status(400).json({
        received: false,
        error: "Invalid GitHub push payload",
      });
    }

    console.log("[github] repository:", repository.full_name);
    console.log("[github] branch:", branch);
    console.log("[github] commit:", commitSha);

    // Find the repository registered in Nimbus
    const dbRepository = await prisma.repository.findUnique({
      where: {
        url: repository.clone_url,
      },
      include: {
        workflows: true,
      },
    });

    if (!dbRepository) {
      console.log("Repo not registered in Nimbus")
      return res.status(404).json({
        received: false,
        error: "Repository not registered in Nimbus",
      });
    }

    // For now, use the first workflow.
    // Later we can support multiple workflows/config selection.
    const workflow = dbRepository.workflows[0];

    if (!workflow) {
      console.log("No workflow configured for repository")
      return res.status(400).json({
        received: false,
        error: "No workflow configured for repository",
      });
    }

    console.log("Workflow configured:", workflow.id)

    // Reuse our existing workflow-run logic.
    const run = await createWorkflowRun(workflow.id, {
      branch,
      commitSha,
    });

    console.log("[github] workflow run created:", run?.id);

    return res.status(202).json({
      received: true,
      runId: run?.id,
    });
  } catch (error) {
    next(error);
  }
};