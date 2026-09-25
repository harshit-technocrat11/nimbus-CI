import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const SESSION_COOKIE_NAME = "nimbus_token";

export interface AuthUser {
  id: string;
  githubUsername: string;
  avatarUrl?: string | null;
  email?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// verifies JWT, rejects with 401 if missing or invalid
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token =
    req.cookies?.[SESSION_COOKIE_NAME] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

//  verifies JWT if present and sets req.user without blocking
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token =
    req.cookies?.[SESSION_COOKIE_NAME] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = decoded;
  } catch {
   
  }

  next();
}
