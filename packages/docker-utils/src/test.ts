import { executeCommand } from "./executor";

async function main() {
    await executeCommand(
        "node:22",
        'echo "Hello from nimbus-CI" && sleep 2 && echo "This is a test"'
    );

      console.log("Container execution finished.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});