import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "@nimbus-ci/logger";

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`API server started on port ${PORT}`);
});
