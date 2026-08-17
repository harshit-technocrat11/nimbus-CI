import { Queue } from "bullmq";
import { redisConnection } from "./connection";

export const CI_QUEUE_NAME = "ci-jobs";

export const ciQueue = new Queue(CI_QUEUE_NAME, {
    connection: redisConnection
});

