import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { logger } from "@nimbus-ci/logger";

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation error",
      errors: err.flatten(),
    });
    return;
  }

  logger.error("Unhandled error", { error: err });

  const message = err instanceof Error ? err.message : "Internal Server Error";
  res.status(500).json({
    message,
  });
};
