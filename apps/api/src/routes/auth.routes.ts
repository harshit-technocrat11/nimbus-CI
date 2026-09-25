import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@nimbus-ci/db";
import { logger } from "@nimbus-ci/logger";
import { env } from "../config/env.js";
import { requireAuth, SESSION_COOKIE_NAME } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.get("/auth/github", (req, res) => {
  if (!env.GITHUB_CLIENT_ID) {
    return res.status(500).json({
      message: "GITHUB_CLIENT_ID is not configured in server environment",
    });
  }

  const callbackUrl = `${env.API_URL}/api/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
    env.GITHUB_CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=read:user,user:email`;

  res.redirect(githubAuthUrl);
});

// GitHub OAuth Callback
router.get("/auth/github/callback", async (req, res) => {
  const code = req.query.code as string | undefined;

  if (!code) {
    logger.error("GitHub OAuth callback missing code query parameter");
    return res.redirect(`${env.FRONTEND_URL}?error=missing_code`);
  }

  try {
    // exchange temporary code for github access token
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

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      logger.error("Failed to obtain GitHub access token", { tokenData });
      return res.redirect(`${env.FRONTEND_URL}?error=oauth_token_failed`);
    }

    // fetch user details from github
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "Nimbus-CI",
      },
    });

    if (!userRes.ok) {
      logger.error("Failed to fetch GitHub user details", { status: userRes.status });
      return res.redirect(`${env.FRONTEND_URL}?error=github_user_fetch_failed`);
    }

    const ghUser = await userRes.json();

    // find or create user in DB
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

    // 7day expiry
    const jwtPayload = {
      id: user.id,
      githubUsername: user.githubUsername,
      avatarUrl: user.avatarUrl,
      email: user.email,
    };

    const token = jwt.sign(jwtPayload, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // set secure httpOnly cookie
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    logger.info(`User logged in via GitHub: ${user.githubUsername} (${user.id})`);

    // Redirect to frontend repositories dashboard
    return res.redirect(`${env.FRONTEND_URL}/repositories`);
  } catch (error) {
    logger.error("GitHub OAuth callback error", { error });
    return res.redirect(`${env.FRONTEND_URL}?error=internal_auth_error`);
  }
});

//  Get current authenticated user profile
router.get("/auth/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

// 4. Logout
router.post("/auth/logout", (req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.json({ message: "Logged out successfully" });
});

export default router;
