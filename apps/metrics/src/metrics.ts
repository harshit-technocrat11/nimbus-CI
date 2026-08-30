import * as client from "@prometheus-io/client";
import { getCIQueueMetrics } from "@nimbus-ci/queue";

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

  queueWaiting.set(counts.waiting ?? 0);
  queueActive.set(counts.active ?? 0);
  queueDelayed.set(counts.delayed ?? 0);
  queueFailed.set(counts.failed ?? 0);
  queueCompleted.set(counts.completed ?? 0);

  return counts;
}

export { client };
export const register = client.register;
