import { Redis } from "ioredis";

export const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("redis connected");
});

redisConnection.on("error", (err: Error) => {
  console.error("redis connection error", err);
});

export default redisConnection;