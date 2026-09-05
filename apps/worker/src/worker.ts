import { ConnectionClosedError, Worker } from "bullmq";
import { redisConnection, CI_QUEUE_NAME } from "@nimbus-ci/queue";
import { executeJob } from "@nimbus-ci/docker-utils";
import { connectProducer, emitLog } from "@nimbus-ci/kafka";

import { logger } from "@nimbus-ci/logger";
import { gitManager } from "./git/git-manager.js";
import { workspaceManager } from "./workspace/workspace-manager.js";


// connect kafka producer
try { 
  await connectProducer();
  logger.info("Connected to kafka producer")
} catch(error) {
  logger.error("❌ Failed to connect to kafka producer", { error });

}

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

    let sequence = 0;
    
    // log emitter helper 

    const sendLog = async (text: string, stream: "STDOUT" | "STDERR" = "STDOUT") => {
          sequence++;
          try {
            await emitLog(
              job.id!,
              JSON.stringify({
                jobId: job.id,
                sequence,
                stream,
                message: text,
                timestamp: Date.now(),
              })
            );
          } catch (err) {
            logger.error(`Failed to stream log to Kafka for job ${job.id}`, { err });
          }
        };


    try {
      //1. create workspace

      workspacePath = await workspaceManager.create(job.id!);

      logger.info(`Workspace created: ${workspacePath}`);

      // 2. clone+ checkout commit Sha
      await gitManager.checkout(repositoryUrl, commitSha, workspacePath);
      logger.info(`Repository checked out at commit ${commitSha}`);

      // 3. execute the docker job - with  live streaming
      const result = await executeJob({
        image,
        steps: jobSteps,
        env,
        workspacePath,
        onLog: async (logchunk)=>{
          await sendLog(logchunk)
        }
      });


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
