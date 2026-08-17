import { ciQueue, redisConnection } from "@nimbus-ci/queue"

async function main() {
    const job = await ciQueue.add("run-ci", {
        image: 'node:22',
        // command: 'echo "Hello from the CI worker" && node --version && sleep 2 && echo "This is a test"'

        // command: 'echo "Starting tests..." && exit 1',

        steps : [
            'echo "Hello from nimbus CI"',
            "node --version",
            'echo "Running tests ..."'
        ]
    });
    console.log(`✅ Job enqueued with ID: ${job.id}`);

    await ciQueue.close();

}

main().catch((err) => {
    console.error("❌ Error enqueuing job:", err);
    process.exit(1);
});