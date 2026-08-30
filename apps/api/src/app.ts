import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { httpLogger, logger } from "@nimbus-ci/logger";
import githubRoutes from "./routes/github.routes.js";

import repositoryRoutes from "./routes/repository.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import workflowRunRoutes from "./routes/workflow-run.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { register, updateQueueMetrics } from "./metrics/prometheus.js";

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

app.use("/repositories", repositoryRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api", workflowRoutes);
app.use("/api", workflowRunRoutes);

app.get("/metrics", async (_req, res) => {
  try {
    await updateQueueMetrics();
    res.setHeader("Content-Type", register.contentType);
    res.send(await register.metrics());
  } catch (error) {
    logger.error("Failed to collect prometheus metrics", { error });
    res.status(500).send("Failed to collect prometheus metrics");
  }
});

app.get("/metrics/queue", async (_req, res) => {
  try {
    const counts = await updateQueueMetrics();

    res.json({
      waiting: counts.waiting,
      active: counts.active,
      delayed: counts.delayed,
      failed: counts.failed,
      completed: counts.completed,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to read CI queue metrics",
    });
  }
});

app.get("/health", (_req, res) => {
  logger.info("/health - ok");
  res.status(200).json({
    status: "ok",
    service: "nimbus-api",
  });
});

app.use(githubRoutes);

app.use(errorHandler);

export default app;
