import { ConnectionClosedError, Worker } from "bullmq";
import { redisConnection, CI_QUEUE_NAME } from "@nimbus-ci/queue";
import { executeJob } from "@nimbus-ci/docker-utils";
import { logger } from "@nimbus-ci/logger";
import { gitManager } from "./git/git-manager.js";
import { workspaceManager } from "./workspace/workspace-manager.js";

const worker = new Worker(
  CI_QUEUE_NAME,
  async (job) => {
    logger.info(` Processing job ${job.id}`);
    logger.info(`Job data: ${JSON.stringify(job.data)}`);

    // extract job data
    const { image, steps, commands, env, repositoryUrl, commitSha } = job.data;

    // Validate job data

    const jobSteps = steps || commands;

    if (!image) {
      throw new Error("Job must contain 'image'");
    }

    if (!jobSteps || !Array.isArray(jobSteps)) {
      throw new Error("Job must contain 'steps'");
    }

    if (!repositoryUrl) {
      throw new Error("Job must contain 'repositoryUrl'");
    }

    if (!commitSha) {
      throw new Error("Job must contain 'commitSha'");
    }

    let workspacePath: string | undefined;

    try {
      //1. create workspace

      workspacePath = await workspaceManager.create(job.id!);

      logger.info(`Workspace created: ${workspacePath}`);

      // 2. clone+ checkout commit Sha
      await gitManager.checkout(repositoryUrl, commitSha, workspacePath);
      logger.info(`Repository checked out at commit ${commitSha}`);

      // 3. execute the docker job

      const result = await executeJob({
        image,
        steps: jobSteps,
        env,
        workspacePath,
      });

      // 4. handling failures/ execptions
      if (!result.success) {
        throw new Error("CI job failed");
      }

      logger.info(`Job ${job.id} completed successfully`);

      return result;

    } 
    finally {
  
      // 5.  cleanup workspace
     
      if (workspacePath) {
        await workspaceManager.cleanup(job.id!);

        logger.info(`Workspace cleaned: ${workspacePath}`);
      }
    }
  },
  {
    connection: redisConnection,

    concurrency: 1,
  },
);

// LOGS
worker.on("completed", (job) => {
  logger.info(` Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  logger.error(`❌ Job ${job?.id} failed: ${error.message}`, { error });
});

logger.info(" Worker is running...");
