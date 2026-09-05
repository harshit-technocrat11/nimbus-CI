
export { kafka, LOGS_TOPIC } from "./client.js";
export {
  producer,
  connectProducer,
  emitLog,
  emitLogs,
  disconnectProducer,
} from "./producer.js";
export {
  createConsumer,
  startConsumer,
  type ConsumerOptions,
} from "./consumer.js";
