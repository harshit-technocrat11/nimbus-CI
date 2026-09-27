import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { httpLogger, logger } from "@nimbus-ci/logger";
import githubRoutes from "./routes/github.routes.js";
import authRoutes from "./routes/auth.routes.js";

import repositoryRoutes from "./routes/repository.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import workflowRunRoutes from "./routes/workflow-run.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";

const app: Express = express();

app.use(helmet());
app.use(httpLogger);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lightweight cookie parsing middleware for JWT auth
app.use((req, _res, next) => {
  if (!req.cookies && req.headers.cookie) {
    (req as any).cookies = Object.fromEntries(
      req.headers.cookie.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, decodeURIComponent(v.join("="))];
      })
    );
  }
  next();
});

// Authentication routes
app.use(authRoutes);
app.use("/api", authRoutes);

app.use("/repositories", repositoryRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api", workflowRoutes);
app.use("/api", workflowRunRoutes);

app.get(["/health", "/api/health"], (_req, res) => {
  logger.info("/health - ok");
  res.status(200).json({
    status: "ok",
    service: "nimbus-api",
  });
});

app.use(githubRoutes);
app.use("/api", githubRoutes);

app.use(errorHandler);

export default app;
