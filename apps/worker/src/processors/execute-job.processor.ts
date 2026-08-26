import { Job } from "bullmq";
import type { ExecuteJobPayload } from "@nimbus-ci/queue";

export async function executeJob(job: Job<ExecuteJobPayload>) {
  const data = job.data;

  console.log("");
  console.log("======================================");
  console.log(`[Worker] Starting job: ${data.name}`);
  console.log(`[Worker] Job ID: ${data.jobId}`);
  console.log(`[Worker] Image: ${data.image}`);
  console.log("======================================");

    // job execution 
    

  console.log(`[Worker] Job completed: ${data.name}`);

  return {
    success: true,
    jobId: data.jobId,
  };
}
