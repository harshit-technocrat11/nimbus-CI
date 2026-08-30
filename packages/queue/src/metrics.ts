import { ciQueue } from "./queues.js";
export async function getCIQueueMetrics() {
  const counts = await ciQueue.getJobCounts(
    "waiting",
    "active",
    "delayed",
    "failed",
    "completed"
  );

  return counts;
}