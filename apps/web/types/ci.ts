export type WorkflowRunStatus = 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export type JobStatus = 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export type TriggerType = 'MANUAL' | 'GITHUB_PUSH' | 'WEBHOOK';

export type JobLogStream = 'STDOUT' | 'STDERR';

export type RunnerStatus = 'ONLINE' | 'OFFLINE' | 'BUSY' | 'DRAINING';

export interface Repository {
  id: string;
  name: string;
  owner: string;
  url: string;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  workflows?: Workflow[];
  latestRun?: WorkflowRun;
}

export interface WorkflowJobDefinition {
  name: string;
  commands: string[];
}

export interface Workflow {
  id: string;
  repositoryId: string;
  name: string;
  configVersion: number;
  definition: WorkflowJobDefinition[];
  createdAt: string;
  updatedAt: string;
  repository?: Repository;
  runs?: WorkflowRun[];
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  branch: string;
  commitSha: string | null;
  status: WorkflowRunStatus;
  triggerType: TriggerType;
  queuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  workflow?: Workflow;
  jobs?: Job[];
  durationSeconds?: number;
}

export interface Job {
  id: string;
  workflowRunId: string;
  name: string;
  commands: string[];
  status: JobStatus;
  runnerId: string | null;
  queuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  exitCode: number | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  workflowRun?: WorkflowRun;
  runner?: Runner | null;
  logs?: JobLog[];
  durationSeconds?: number;
}

export interface JobLog {
  id: string;
  jobId: string;
  sequence: number;
  stream: JobLogStream;
  message: string;
  createdAt: string;
}

export interface Runner {
  id: string;
  name: string;
  status: RunnerStatus;
  capacity: number;
  activeJobs: number;
  lastHeartbeat: string | null;
  createdAt: string;
  updatedAt: string;
  jobs?: Job[];
}

export interface CreateRepositoryInput {
  name: string;
  owner?: string;
  url?: string;
  githubUrl?: string;
  defaultBranch?: string;
}

export interface CreateWorkflowRunInput {
  branch?: string;
  commitSha?: string;
  workflowId?: string;
}

export interface CreateWorkflowInput {
  name: string;
  jobs: WorkflowJobDefinition[];
}

export interface FilterOptions {
  status?: string;
  repositoryId?: string;
  branch?: string;
  searchQuery?: string;
}
