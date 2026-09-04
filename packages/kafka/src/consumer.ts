// packages/kafka/src/consumer.ts
import { type Consumer } from "kafkajs";
import { kafka, LOGS_TOPIC } from "./client.js";

export interface ConsumerOptions {
  groupId: string;
  fromBeginning?: boolean;
}

export const createConsumer = ({ groupId }: { groupId: string }): Consumer => {
  return kafka.consumer({
    groupId,
    allowAutoTopicCreation: true,
  });
};

export const startConsumer = async (
  options: ConsumerOptions,
  onMessage: (data: { key: string | null; value: string }) => Promise<void> | void
): Promise<Consumer> => {
    
  const consumer = createConsumer({ groupId: options.groupId });

  await consumer.connect();
  await consumer.subscribe({
    topic: LOGS_TOPIC,
    fromBeginning: options.fromBeginning ?? false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const key = message.key ? message.key.toString() : null;
      const value = message.value ? message.value.toString() : "";
      await onMessage({ key, value });
    },
  });

  return consumer;
};
