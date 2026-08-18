/*
  Warnings:

  - You are about to drop the column `branch` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `commitSha` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `repositoryId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `triggerType` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the `CiConfig` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `commands` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workflowRunId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WorkflowRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "CiConfig" DROP CONSTRAINT "CiConfig_repositoryId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_repositoryId_fkey";

-- DropIndex
DROP INDEX "Job_repositoryId_idx";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "branch",
DROP COLUMN "commitSha",
DROP COLUMN "repositoryId",
DROP COLUMN "triggerType",
ADD COLUMN     "commands" JSONB NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "workflowRunId" UUID NOT NULL;

-- DropTable
DROP TABLE "CiConfig";

-- CreateTable
CREATE TABLE "Workflow" (
    "id" UUID NOT NULL,
    "repositoryId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "configVersion" INTEGER NOT NULL DEFAULT 1,
    "definition" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" UUID NOT NULL,
    "workflowId" UUID NOT NULL,
    "branch" TEXT NOT NULL,
    "commitSha" TEXT,
    "status" "WorkflowRunStatus" NOT NULL DEFAULT 'QUEUED',
    "triggerType" "TriggerType" NOT NULL DEFAULT 'MANUAL',
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Workflow_repositoryId_idx" ON "Workflow"("repositoryId");

-- CreateIndex
CREATE INDEX "WorkflowRun_workflowId_idx" ON "WorkflowRun"("workflowId");

-- CreateIndex
CREATE INDEX "WorkflowRun_status_idx" ON "WorkflowRun"("status");

-- CreateIndex
CREATE INDEX "WorkflowRun_queuedAt_idx" ON "WorkflowRun"("queuedAt");

-- CreateIndex
CREATE INDEX "WorkflowRun_commitSha_idx" ON "WorkflowRun"("commitSha");

-- CreateIndex
CREATE INDEX "Job_workflowRunId_idx" ON "Job"("workflowRunId");

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
