import { ciQueue } from "@nimbus-ci/queue";
import type { ExecuteJobPayload } from "@nimbus-ci/queue";

export class WorkflowJobEnqueuerService {
  async enqueueJob(payload: ExecuteJobPayload) {
    const job = await ciQueue.add(
      "execute-job",
      payload,
      {
        attempts: 3,

        backoff: {
          type: "exponential",
          delay: 5000,
        },

        removeOnComplete: false,
        removeOnFail: false,
      },
    );

    console.log(
      `[Queue] Enqueued job ${payload.jobId} -> BullMQ ${job.id}`,
    );

    return job;
  }

  async enqueueJobs(jobs: ExecuteJobPayload[]) {
    const createdJobs = [];

    for (const job of jobs) {
      const created = await this.enqueueJob(job);
      createdJobs.push(created);
    }

    return createdJobs;
  }
}