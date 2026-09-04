
import { Kafka } from "kafkajs";

const brokers = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");
const username = process.env.KAFKA_SASL_USERNAME;
const password = process.env.KAFKA_SASL_PASSWORD;


export const LOGS_TOPIC = process.env.KAFKA_LOGS_TOPIC || "ci.job.logs";


export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "nimbus-ci",
  brokers,
  ssl: process.env.KAFKA_SSL === "true",
  sasl:
    username && password
      ? {
          mechanism: (process.env.KAFKA_SASL_MECHANISM as any) || "scram-sha-256",
          username,
          password,
        }
      : undefined,
});
