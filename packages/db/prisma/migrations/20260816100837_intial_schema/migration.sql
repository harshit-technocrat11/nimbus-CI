-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('MANUAL');

-- CreateEnum
CREATE TYPE "JobLogStream" AS ENUM ('STDOUT', 'STDERR');

-- CreateEnum
CREATE TYPE "RunnerStatus" AS ENUM ('ONLINE', 'OFFLINE', 'BUSY', 'DRAINING');

-- CreateTable
CREATE TABLE "Repository" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CiConfig" (
    "id" UUID NOT NULL,
    "repositoryId" UUID NOT NULL,
    "configVersion" INTEGER NOT NULL DEFAULT 1,
    "steps" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CiConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" UUID NOT NULL,
    "repositoryId" UUID NOT NULL,
    "branch" TEXT NOT NULL,
    "commitSha" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "triggerType" "TriggerType" NOT NULL DEFAULT 'MANUAL',
    "runnerId" UUID,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "exitCode" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobLog" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "stream" "JobLogStream" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Runner" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RunnerStatus" NOT NULL DEFAULT 'OFFLINE',
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "activeJobs" INTEGER NOT NULL DEFAULT 0,
    "lastHeartbeat" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Runner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_url_key" ON "Repository"("url");

-- CreateIndex
CREATE INDEX "Repository_owner_idx" ON "Repository"("owner");

-- CreateIndex
CREATE UNIQUE INDEX "CiConfig_repositoryId_key" ON "CiConfig"("repositoryId");

-- CreateIndex
CREATE INDEX "Job_repositoryId_idx" ON "Job"("repositoryId");

-- CreateIndex
CREATE INDEX "Job_runnerId_idx" ON "Job"("runnerId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_queuedAt_idx" ON "Job"("queuedAt");

-- CreateIndex
CREATE INDEX "JobLog_jobId_idx" ON "JobLog"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "JobLog_jobId_sequence_key" ON "JobLog"("jobId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "Runner_name_key" ON "Runner"("name");

-- CreateIndex
CREATE INDEX "Runner_status_idx" ON "Runner"("status");

-- CreateIndex
CREATE INDEX "Runner_lastHeartbeat_idx" ON "Runner"("lastHeartbeat");

-- AddForeignKey
ALTER TABLE "CiConfig" ADD CONSTRAINT "CiConfig_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_runnerId_fkey" FOREIGN KEY ("runnerId") REFERENCES "Runner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLog" ADD CONSTRAINT "JobLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
