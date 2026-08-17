import { ciQueue, redisConnection } from "@nimbus-ci/queue"

async function main() {
    const job = await ciQueue.add("run-ci", {
        repository: "test-repo101",
        branch: "main",
        commitSha: "abc1234z"
    });
    console.log(`✅ Job enqueued with ID: ${job.id}`);

    await ciQueue.close();
    await redisConnection.quit();
}

main().catch((err) => {
    console.error("❌ Error enqueuing job:", err);
    process.exit(1);
});