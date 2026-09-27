import type { Request, Response, NextFunction } from "express";
import { prisma } from "@nimbus-ci/db";
import { logger } from "@nimbus-ci/logger";
import { workflowService } from "../services/workflow/workflow.service.js";
import { fetchWorkflowFromGitHub } from "../services/github/github-fetcher.service.js";

export const githubWebhookController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = req.headers["x-github-event"];

    // For now, only handle push events
    if (event !== "push") {
      logger.info(`[GitHub] Ignored event: ${event}`);
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

    logger.info("[Webhook] GitHub push event received", {
      repo: repository.full_name,
      branch,
      commitSha: commitSha.substring(0, 7),
    });

    // Find the repository registered in Nimbus (resilient to .git suffix and html vs clone URLs)
    const dbRepository = await prisma.repository.findFirst({
      where: {
        OR: [
          { url: repository.clone_url },
          { url: repository.html_url },
          { url: repository.clone_url?.replace(/\.git$/, "") },
          { url: `${repository.html_url}.git` },
        ],
      },
      include: {
        workflows: true,
      },
    });

    if (!dbRepository) {
      logger.warn("[Webhook] Repository not registered in Nimbus DB", { url: repository.clone_url });
      return res.status(404).json({
        received: false,
        error: "Repository not registered in Nimbus",
      });
    }

    // Get existing workflow or create default
    let workflow = dbRepository.workflows[0];
    if (!workflow) {
      logger.info("[Webhook] Creating default workflow record for repository", { repoId: dbRepository.id });
      workflow = await prisma.workflow.create({
        data: {
          repositoryId: dbRepository.id,
          name: "nimbus-ci",
          definition: {},
        },
      });
    }

    const owner =
      repository.owner?.login ||
      repository.owner?.name ||
      repository.full_name?.split("/")[0] ||
      dbRepository.owner;
    const repoName = repository.name || dbRepository.name;

   
    logger.info("[Webhook] Fetching workflow file from GitHub repository", {
      owner,
      repo: repoName,
      commitSha: commitSha.substring(0, 7),
    });
    const fetched = await fetchWorkflowFromGitHub(owner, repoName, commitSha);

    let runPipelineId: string;

    if (fetched) {
      logger.info("[Webhook] Running newly fetched workflow file", { path: fetched.path });

      const result = await workflowService.runWorkflow({
        workflowContent: fetched.content,
        workflowId: workflow.id,
        repositoryUrl: repository.clone_url,
        branch,
        commitSha,
        triggerType: "MANUAL",
      });

      // Update database snapshot with latest parsed workflow
      await prisma.workflow
        .update({
          where: { id: workflow.id },
          data: {
            definition: result.parsedWorkflow as any,
            ...(result.parsedWorkflow.name ? { name: result.parsedWorkflow.name } : {}),
          },
        })
        .catch((err) => logger.warn("[Webhook] Failed to update workflow snapshot in DB", { err }));

      runPipelineId = result.pipeline.id;
    } else {
      logger.warn("[Webhook] No workflow file found at commit, falling back to DB definition", { commitSha });

      const result = await workflowService.runWorkflowById(workflow.id, {
        branch,
        commitSha,
      });

      runPipelineId = result.pipeline.id;
    }

    logger.info("[Webhook] Pipeline run created and dispatched successfully", { runId: runPipelineId });

    return res.status(202).json({
      received: true,
      runId: runPipelineId,
    });
  } catch (error: any) {
    logger.error("[Webhook] Error processing GitHub webhook", {
      message: error?.message || String(error),
      stack: error?.stack,
    });
    next(error);
  }
};
