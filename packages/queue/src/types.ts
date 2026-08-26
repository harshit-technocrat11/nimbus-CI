export interface ExecuteJobPayload {
  pipelineId: string;
  jobId: string;

  repositoryUrl: string;
  commitSha: string;

  name: string;
  image: string;

  steps: {
    command: string;
  }[];
}