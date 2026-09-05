import "dotenv/config";
import { Kafka } from "kafkajs";

const getBrokers = (): string[] => {
  const brokersEnv = process.env.KAFKA_BROKERS;
  if (!brokersEnv) {
    return ["localhost:9092"];
  }
  return brokersEnv.split(",").map((b) => b.trim()).filter(Boolean);
};

export const LOGS_TOPIC = process.env.KAFKA_LOGS_TOPIC || "ci.job.logs";

const username = process.env.KAFKA_SASL_USERNAME;
const password = process.env.KAFKA_SASL_PASSWORD;
const useSsl = process.env.KAFKA_SSL === "true";

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "nimbus-ci",
  brokers: getBrokers(),
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  sasl:
    username && password
      ? {
          mechanism: (process.env.KAFKA_SASL_MECHANISM as any) || "scram-sha-256",
          username,
          password,
        }
      : undefined,
});
