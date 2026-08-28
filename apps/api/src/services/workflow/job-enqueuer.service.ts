import { ciQueue } from "@nimbus-ci/queue";
import type { ExecuteJobPayload } from "@nimbus-ci/queue";
import { logger } from "@nimbus-ci/logger";

export class JobEnqueuerService {
  async enqueueJobs(jobs: ExecuteJobPayload[]): Promise<any[]> {
    if (jobs.length === 0) {
      return [];
    }

    logger.info(`[Queue] Bulk enqueue ${jobs.length} jobs`);

    const bulkPayloads = jobs.map((job) => ({
      name: "execute-job",
      data: job,
      opts: {
        attempts: 2,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: false,
        removeOnFail: false,
      },
    }));

    const enqueuedJobs = await ciQueue.addBulk(bulkPayloads);

    for (let i = 0; i < jobs.length; i++) {
      const jobData = jobs[i];
      const bullJob = enqueuedJobs[i];
      if (jobData && bullJob) {
        logger.info(`[Queue] Enqueued ${jobData.name} <${bullJob.id}>`);
      }
    }

    return enqueuedJobs;
  }
}

export const jobEnqueuerService = new JobEnqueuerService();
