import express from "express";
import cors from "cors";
import helmet from "helmet";
import { httpLogger, logger } from "@nimbus-ci/logger";

const app: express.Express = express();

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

app.get("/health", (_req, res) => {
  logger.info("/health - ok");
  res.status(200).json({
    status: "ok",
    service: "nimbus-api",
  });
});

export default app;
