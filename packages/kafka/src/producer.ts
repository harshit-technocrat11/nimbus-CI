import { Partitioners } from "kafkajs";
import { kafka, LOGS_TOPIC } from "./client.js";

export const producer = kafka.producer({
  allowAutoTopicCreation: true,
  createPartitioner: Partitioners.DefaultPartitioner,
});

export const connectProducer = async (): Promise<void> => {
  await producer.connect();
};

export const emitLog = async (key: string, value: string): Promise<void> => {
  await producer.send({
    topic: LOGS_TOPIC,
    messages: [{ key, value }],
  });
};

export const emitLogs = async (
  messages: Array<{ key: string; value: string }>
): Promise<void> => {
  if (messages.length === 0) return;
  await producer.send({
    topic: LOGS_TOPIC,
    messages,
  });
};

export const disconnectProducer = async (): Promise<void> => {
  await producer.disconnect();
};
