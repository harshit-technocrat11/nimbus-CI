import * as client from "@prometheus-io/client";
import { getCIQueueMetrics } from "@nimbus-ci/queue";

// Collect default metrics (memory, CPU, event loop, etc.)
client.collectDefaultMetrics();

export const queueWaiting = new client.Gauge({
  name: "nimbus_ci_queue_waiting",
  help: "Number of waiting CI jobs",
});

export const queueActive = new client.Gauge({
  name: "nimbus_ci_queue_active",
  help: "Number of active CI jobs",
});

export const queueDelayed = new client.Gauge({
  name: "nimbus_ci_queue_delayed",
  help: "Number of delayed CI jobs",
});

export const queueFailed = new client.Gauge({
  name: "nimbus_ci_queue_failed",
  help: "Number of failed CI jobs",
});

export const queueCompleted = new client.Gauge({
  name: "nimbus_ci_queue_completed",
  help: "Number of completed CI jobs",
});

export async function updateQueueMetrics() {
  const counts = await getCIQueueMetrics();

  queueWaiting.set(counts.waiting);
  queueActive.set(counts.active);
  queueDelayed.set(counts.delayed);
  queueFailed.set(counts.failed);
  queueCompleted.set(counts.completed);

  return counts;
}

export { client };
export const register = client.register;

   