export interface ExecuteJobPayload {
  pipelineId: string;
  jobId: string;

  repositoryUrl: string;
  commitSha: string;

  name: string;
  image: string;

  env?: Record<string, string>;
  steps: string[];
}

