import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// connection pool
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log(" Starting database seed...");

  const repository = await prisma.repository.upsert({
    where: {
      url: "https://github.com/demo/mini-git-actions",
    },

    update: {},

    create: {
      name: "mini-git-actions",
      owner: "demo",
      url: "https://github.com/demo/mini-git-actions",
      defaultBranch: "main",
    },
  });

  console.log(` Repository: ${repository.name}`);

  // Delete previous workflows for demo repository to avoid stale/duplicate entries
  await prisma.workflow.deleteMany({
    where: { repositoryId: repository.id },
  });

  const workflow = await prisma.workflow.create({
    data: {
      repositoryId: repository.id,
      name: "build",
      configVersion: 1,
      definition: [
        {
          name: "build",
          image: "node:22",
          steps: [
            "echo Starting build",
            "echo Installing dependencies",
            "echo Running tests",
            "echo Build successful",
          ],
          commands: [
            "echo Starting build",
            "echo Installing dependencies",
            "echo Running tests",
            "echo Build successful",
          ],
        },
      ],
    },
  });

  console.log(`Workflow: ${workflow.name}`);

  const run = await prisma.workflowRun.create({
    data: {
      workflowId: workflow.id,
      branch: "main",
      commitSha: "demo-commit-001",
      status: "QUEUED",
      triggerType: "MANUAL",
    },
  });

  console.log(` Workflow Run: ${run.id}`);

  const job = await prisma.job.create({
    data: {
      workflowRunId: run.id,
      name: "build",
      commands: [
        "echo Starting build",
        "echo Installing dependencies",
        "echo Running tests",
        "echo Build successful",
      ],
      status: "QUEUED",
    },
  });

  console.log(` Job: ${job.name}`);

  console.log({
    repositoryId: repository.id,
    workflowId: workflow.id,
    workflowRunId: run.id,
    jobId: job.id,
  });

  // 1. Create/find the repository
  const repository2 = await prisma.repository.upsert({
    where: {
      url: "https://github.com/harshit-technocrat11/test-ci.git",
    },
    update: {
      name: "test-ci",
      owner: "harshit-technocrat11",
      defaultBranch: "main",
    },
    create: {
      name: "test-ci",
      owner: "harshit-technocrat11",
      url: "https://github.com/harshit-technocrat11/test-ci.git",
      defaultBranch: "main",
    },
  });

  // Delete previous workflows for repository2 to avoid stale/duplicate entries
  await prisma.workflow.deleteMany({
    where: { repositoryId: repository2.id },
  });

  // 2. Create/find a workflow for this repository
  const workflow2 = await prisma.workflow.create({
    data: {
      name: "test-workflow",
      repositoryId: repository2.id,
      definition: [
        {
          name: "build",
          image: "node:22",
          steps: [
            "echo 'Hello from Nimbus CI Sandbox'",
            "echo 'Running CI job in container'",
            "node --version",
          ],
          commands: [
            "echo 'Hello from Nimbus CI Sandbox'",
            "echo 'Running CI job in container'",
            "node --version",
          ],
        },
      ],
    },
  });

  console.log("Repository seeded:", repository2.id);
  console.log("Workflow seeded:", workflow2.id);
  console.log("\n✅ Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });