import express, { type Express } from "express";
import dotenv from "dotenv";
import { logger } from "@nimbus-ci/logger";
import { register, updateQueueMetrics } from "./metrics.js";

dotenv.config();

const app: Express = express();
const PORT = Number(process.env.PORT || process.env.METRICS_PORT || 9090);

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

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "nimbus-metrics",
  });
});

app.listen(PORT, () => {
  logger.info(`Metrics service started on port ${PORT}`);
});

export default app;
