import { Router } from "express";
import { prisma } from "@nimbus-ci/db";
import { logger } from "@nimbus-ci/logger";
import { env } from "../config/env.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { githubWebhookController } from "../controllers/github-webhook.controller.js";

const router: Router = Router();

//  Webhook endpoint called by GitHub on push events
router.post("/webhooks/github", githubWebhookController);

// Fetch authenticated user's repositories from GitHub
router.get("/github/repos", requireAuth, async (req, res) => {
  const accessToken = req.user?.githubAccessToken;

  if (!accessToken) {
    return res.status(401).json({
      message: "GitHub access token not available. Please sign in again.",
      needsReauth: true,
    });
  }

  try {
    logger.info("[GitHub Repos] Requesting repositories for user", { user: req.user?.githubUsername });

    const ghRes = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated&type=all", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Nimbus-CI",
        Accept: "application/vnd.github+json",
      },
    });

    if (!ghRes.ok) {
      logger.error("[GitHub Repos] Failed to fetch user repositories from GitHub", { status: ghRes.status });
      return res.status(ghRes.status).json({ message: "Failed to fetch repositories from GitHub" });
    }

    const repos = (await ghRes.json()) as any[];
    logger.info("[GitHub Repos] Successfully fetched user repositories", { count: repos.length });

    // Check which repositories are already connected in Nimbus DB
    const urls = repos.flatMap((r) => [r.clone_url, r.html_url]).filter(Boolean);
    const existing = await prisma.repository.findMany({
      where: {
        url: { in: urls },
      },
      select: {
        id: true,
        url: true,
      },
    });
    const connectedUrlSet = new Set(existing.map((e) => e.url));

    const formattedRepos = repos.map((r) => {
      const isConnected = connectedUrlSet.has(r.clone_url) || connectedUrlSet.has(r.html_url);
      return {
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        owner: r.owner?.login,
        defaultBranch: r.default_branch || "main",
        private: r.private,
        htmlUrl: r.html_url,
        cloneUrl: r.clone_url,
        description: r.description,
        updatedAt: r.updated_at,
        isConnected,
      };
    });

    return res.json({ repositories: formattedRepos });
  } catch (error) {
    logger.error("[GitHub Repos] Error fetching GitHub repositories", { error });
    return res.status(500).json({ message: "Internal server error fetching repositories" });
  }
});

// 3. Connect a selected GitHub repository & register push webhook automatically
router.post("/github/repos/connect", requireAuth, async (req, res) => {
  const { name, owner, defaultBranch, url } = req.body;

  if (!name || !url) {
    return res.status(400).json({ message: "Missing required fields (name, url)" });
  }

  const accessToken = req.user?.githubAccessToken;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      message: "Authenticated user information is unavailable. Please sign in again.",
      needsReauth: true,
    });
  }

  const repoOwner = owner || req.user?.githubUsername || "unknown";
  const branch = defaultBranch || "main";

  logger.info("[GitHub Connect] Connecting repository", {
    repo: `${repoOwner}/${name}`,
    userId,
    url,
  });

  try {
    const repo = await prisma.repository.upsert({
      where: { url },
      update: {
        name,
        owner: repoOwner,
        defaultBranch: branch,
        userId,
      },
      create: {
        name,
        owner: repoOwner,
        url,
        defaultBranch: branch,
        userId,
      },
    });

    logger.info("[GitHub Connect] Repository saved in database", { repoId: repo.id });

    // Automatically register push webhook with GitHub API if access token is available
    if (accessToken) {
      const baseApiUrl = env.API_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");
      const webhookUrl = `${baseApiUrl}/api/webhooks/github`;

      logger.info("[GitHub Connect] Registering GitHub push webhook", { webhookUrl });

      try {
        const hookRes = await fetch(`https://api.github.com/repos/${repoOwner}/${name}/hooks`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "Nimbus-CI",
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "web",
            active: true,
            events: ["push"],
            config: {
              url: webhookUrl,
              content_type: "json",
              insecure_ssl: "0",
            },
          }),
        });

        if (hookRes.status === 201) {
          logger.info(`[GitHub Connect] Push webhook created successfully for ${repoOwner}/${name}`);
        } else if (hookRes.status === 422) {
          logger.info(`[GitHub Connect] Push webhook already exists on ${repoOwner}/${name}`);
        } else {
          const errData = await hookRes.text();
          logger.warn(`[GitHub Connect] Could not create GitHub webhook on ${repoOwner}/${name}`, {
            status: hookRes.status,
            errData,
          });
        }
      } catch (hookErr) {
        logger.warn("[GitHub Connect] Failed to call GitHub webhook API", { hookErr });
      }
    }

    return res.status(201).json(repo);
  } catch (error) {
    logger.error("[GitHub Connect] Error connecting repository", { error });
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to connect repository",
    });
  }
});

export default router;

