import { ConnectionClosedError, Worker } from "bullmq";
import { redisConnection, CI_QUEUE_NAME } from "@nimbus-ci/queue";
import { executeJob } from "@nimbus-ci/docker-utils";
import { logger } from "@nimbus-ci/logger";

const worker = new Worker(
  CI_QUEUE_NAME,
  async (job) => {
    logger.info(` Processing job ${job.id}`);
    logger.info(`Job data: ${JSON.stringify(job.data)}`);

    // executing the docker container
    const image = job.data.image || "node:22";
    const steps = job.data.steps || job.data.commands;

    if (!image || !steps || !Array.isArray(steps)) {
      throw new Error("Job must contain 'image' and 'steps'");
    }

    const result = await executeJob({
      image,
      steps,
    });

    if (!result.success) {
      throw new Error("CI job failed");
    }

    logger.info(`Job ${job.id} completed successfully`);

    return result;
  },
  {
    connection: redisConnection,
  },
);

worker.on("completed", (job) => {
  logger.info(` Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  logger.error(`❌ Job ${job?.id} failed: ${error.message}`, { error });
});

logger.info(" Worker is running...");
