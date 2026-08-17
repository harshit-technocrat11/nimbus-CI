import { ConnectionClosedError, Worker } from "bullmq";
import { redisConnection, CI_QUEUE_NAME } from "@nimbus-ci/queue";
import { executeJob } from "@nimbus-ci/docker-utils";

const worker = new Worker(
  CI_QUEUE_NAME,
  async (job) => {
    console.log(` Processing job ${job.id}`);
    console.log("Job data:", job.data);

    // executing the docker container
    const { image, steps } = job.data;

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

    console.log(`🎉 Job ${job.id} completed successfully`);

    return result;
  },
  {
    connection: redisConnection,
  },
);

worker.on("completed", (job) => {
  console.log(` Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`❌ Job ${job?.id} failed`);
  console.error(error);
});

console.log(" Worker is running...");
