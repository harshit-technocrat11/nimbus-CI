import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@nimbus-ci/db";
import { logger } from "@nimbus-ci/logger";
import { env } from "../config/env.js";
import { requireAuth, SESSION_COOKIE_NAME } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.get("/auth/github", (req, res) => {
  if (!env.GITHUB_CLIENT_ID) {
    logger.error("GITHUB_CLIENT_ID is not configured in server environment");
    return res.status(500).json({
      message: "GITHUB_CLIENT_ID is not configured in server environment",
    });
  }

  const baseApiUrl = env.API_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");
  const callbackUrl = `${baseApiUrl}/api/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
    env.GITHUB_CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=read:user,user:email,repo,admin:repo_hook`;

  logger.info("[OAuth] Initiating GitHub OAuth flow", { callbackUrl });
  res.redirect(githubAuthUrl);
});

// GitHub OAuth Callback
router.get("/auth/github/callback", async (req, res) => {
  const code = req.query.code as string | undefined;

  if (!code) {
    logger.error("[OAuth] Callback missing code query parameter");
    return res.redirect(`${env.FRONTEND_URL}?error=missing_code`);
  }

  logger.info("[OAuth] Callback received with code, exchanging for access token");

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      token_type?: string;
      scope?: string;
      error?: string;
    };

    if (!tokenData.access_token) {
      logger.error("[OAuth] Failed to obtain GitHub access token", { tokenData });
      return res.redirect(`${env.FRONTEND_URL}?error=oauth_token_failed`);
    }

    logger.info("[OAuth] Access token obtained, fetching user profile from GitHub");

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "Nimbus-CI",
      },
    });

    if (!userRes.ok) {
      logger.error("[OAuth] Failed to fetch GitHub user details", { status: userRes.status });
      return res.redirect(`${env.FRONTEND_URL}?error=github_user_fetch_failed`);
    }

    const ghUser = (await userRes.json()) as {
      id: number;
      login: string;
      avatar_url?: string | null;
      email?: string | null;
    };

    logger.info("[OAuth] Profile retrieved, upserting user in DB", {
      githubUserId: ghUser.id,
      githubUsername: ghUser.login,
    });

    const user = await prisma.user.upsert({
      where: { githubUserId: String(ghUser.id) },
      update: {
        githubUsername: ghUser.login,
        avatarUrl: ghUser.avatar_url ?? null,
        email: ghUser.email ?? null,
      },
      create: {
        githubUserId: String(ghUser.id),
        githubUsername: ghUser.login,
        avatarUrl: ghUser.avatar_url ?? null,
        email: ghUser.email ?? null,
      },
    });

    logger.info("[OAuth] User record ready in DB", { userId: user.id });

    const jwtPayload = {
      id: user.id,
      githubUsername: user.githubUsername,
      avatarUrl: user.avatarUrl,
      email: user.email,
      githubAccessToken: tokenData.access_token,
    };

    const token = jwt.sign(jwtPayload, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const isSecure = env.NODE_ENV === "production" || env.API_URL.startsWith("https://");

    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    logger.info("[OAuth] Login successful, redirecting to repositories", {
      user: user.githubUsername,
      secure: isSecure,
    });

    return res.redirect(`${env.FRONTEND_URL}/repositories`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    logger.error("[OAuth] Callback exception caught", { error: errorMsg, stack });
    return res.redirect(`${env.FRONTEND_URL}?error=${encodeURIComponent(errorMsg)}`);
  }
});


router.get("/auth/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

//  Logout
router.post("/auth/logout", (req, res) => {
  const isSecure = env.NODE_ENV === "production" || env.API_URL.startsWith("https://");
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    path: "/",
  });

  return res.json({ message: "Logged out successfully" });
});

export default router;
