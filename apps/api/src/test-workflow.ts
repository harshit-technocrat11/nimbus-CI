import { workflowService } from "./services/workflow/workflow.service.js";
import { prisma } from "@nimbus-ci/db";

const workflowYaml = `
name: Node CI

jobs:
  test:
    image: node:22
    steps:
      - npm install
      - npm test

  build:
    image: node:22
    steps:
      - npm install
      - npm run build
`;

async function main() {
  // Ensure a test repository exists in the DB
  const repo = await prisma.repository.upsert({
    where: { url: "https://github.com/demo/mini-git-actions" },
    update: {},
    create: {
      name: "mini-git-actions",
      owner: "demo",
      url: "https://github.com/demo/mini-git-actions",
      defaultBranch: "main",
    },
  });

  // Ensure a workflow record exists for the repository
  let workflow = await prisma.workflow.findFirst({
    where: { repositoryId: repo.id, name: "Node CI" },
  });

  if (!workflow) {
    workflow = await prisma.workflow.create({
      data: {
        repositoryId: repo.id,
        name: "Node CI",
        definition: {},
      },
    });
  }

  // Execute the complete workflow path
  const result = await workflowService.runWorkflow({
    workflowContent: workflowYaml,
    workflowId: workflow.id,
    repositoryUrl: repo.url,
    branch: "main",
    commitSha: "abc1234",
  });

  console.log("\n✅ Workflow successfully parsed, saved to DB, and enqueued:");
  console.log(`Pipeline ID: ${result.pipeline.id}`);
  console.log(`Jobs created: ${result.jobs.map((j) => `${j.name} (${j.id})`).join(", ")}`);

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Workflow test failed:", error);
  process.exit(1);
});
