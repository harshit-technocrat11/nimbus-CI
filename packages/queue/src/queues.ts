import { Queue } from "bullmq";
import { redisConnection } from "./connection";

export const ciQueue = new Queue("ci-jobs", {
    connection: redisConnection
});

