import { ConnectionClosedError, Worker } from "bullmq"
import { redisConnection, CI_QUEUE_NAME } from "@nimbus-ci/queue"

const worker = new Worker(
    CI_QUEUE_NAME, 
    async(job) => {
        console.log(` Processing job ${job.id}`);
        console.log("Job data:", job.data);

         // Pretend we're doing some work
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log(`✅ Job ${job.id} completed`);
        return { result: "Job completed successfully" };
        
    },
    {
        connection: redisConnection
    }
)

worker.on("completed", (job) => {
  console.log(` Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`❌ Job ${job?.id} failed`);
  console.error(error);
});


console.log(" Worker is running...");

