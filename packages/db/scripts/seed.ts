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


  const workflow = await prisma.workflow.create({
    data: {
      repositoryId: repository.id,

      name: "build",

      configVersion: 1,

      definition: {
        jobs: [
          {
            name: "build",
            commands: [
              "echo Starting build",
              "echo Installing dependencies",
              "echo Running tests",
              "echo Build successful",
            ],
          },
        ],
      },
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

  console.log("\n✅ Seed completed successfully.");

  console.log({
    repositoryId: repository.id,
    workflowId: workflow.id,
    workflowRunId: run.id,
    jobId: job.id,
  });
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });