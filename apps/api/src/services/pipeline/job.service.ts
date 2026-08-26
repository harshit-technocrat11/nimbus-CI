import { prisma, type JobStatus, type Job } from "@nimbus-ci/db";

export interface CreateJobInput {
  name: string;
  steps: string[];
}

export const createJob = async (
  pipelineId: string,
  input: CreateJobInput
): Promise<Job> => {
  return prisma.job.create({
    data: {
      workflowRunId: pipelineId,
      name: input.name,
      commands: input.steps,
      status: "QUEUED",
    },
  });
};

export const createJobs = async (
  pipelineId: string,
  jobs: CreateJobInput[]
): Promise<Job[]> => {
  const createdJobs: Job[] = [];
  for (const job of jobs) {
    const created = await createJob(pipelineId, job);
    createdJobs.push(created);
  }
  return createdJobs;
};

export const getJobsForPipeline = async (workflowRunId: string) => {
  return prisma.job.findMany({
    where: {
      workflowRunId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const getJobById = async (id: string) => {
  return prisma.job.findUnique({
    where: { id },
  });
};

export const getJobLogs = async (jobId: string) => {
  return prisma.jobLog.findMany({
    where: {
      jobId,
    },
    orderBy: {
      sequence: "asc",
    },
  });
};

export const updateJobStatus = async (
  id: string,
  status: JobStatus,
  options?: {
    startedAt?: Date;
    completedAt?: Date;
    exitCode?: number | null;
    errorMessage?: string | null;
  }
) => {
  return prisma.job.update({
    where: { id },
    data: {
      status,
      ...(options?.startedAt && { startedAt: options.startedAt }),
      ...(options?.completedAt && { completedAt: options.completedAt }),
      ...(options?.exitCode !== undefined && { exitCode: options.exitCode }),
      ...(options?.errorMessage !== undefined && { errorMessage: options.errorMessage }),
    },
  });
};
