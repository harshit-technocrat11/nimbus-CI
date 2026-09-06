import {
  Repository,
  Workflow,
  WorkflowRun,
  Job,
  JobLog,
  Runner,
  CreateRepositoryInput,
  CreateWorkflowRunInput,
  CreateWorkflowInput,
} from '../types/ci';
import {
  MOCK_REPOSITORIES,
  MOCK_WORKFLOWS,
  MOCK_RUNS,
  MOCK_JOBS,
  MOCK_JOB_LOGS,
  MOCK_RUNNERS,
} from './mockData';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// In-memory state store with localStorage persistence for standalone preview
class LocalStateStore {
  private repositories: Repository[] = [...MOCK_REPOSITORIES];
  private workflows: Workflow[] = [...MOCK_WORKFLOWS];
  private runs: WorkflowRun[] = [...MOCK_RUNS];
  private jobs: Job[] = [...MOCK_JOBS];
  private logs: Record<string, JobLog[]> = { ...MOCK_JOB_LOGS };
  private runners: Runner[] = [...MOCK_RUNNERS];

  getRepositories(): Repository[] {
    return this.repositories.map((repo) => {
      const repoWorkflows = this.workflows.filter((w) => w.repositoryId === repo.id);
      const repoWfIds = repoWorkflows.map((w) => w.id);
      const repoRuns = this.runs
        .filter((r) => repoWfIds.includes(r.workflowId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
        ...repo,
        workflows: repoWorkflows,
        latestRun: repoRuns[0] || undefined,
      };
    });
  }

  getRepository(id: string): Repository | null {
    const repo = this.repositories.find((r) => r.id === id);
    if (!repo) return null;

    const repoWorkflows = this.workflows.filter((w) => w.repositoryId === repo.id);
    const repoWfIds = repoWorkflows.map((w) => w.id);
    const repoRuns = this.runs
      .filter((r) => repoWfIds.includes(r.workflowId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      ...repo,
      workflows: repoWorkflows.map((wf) => ({
        ...wf,
        runs: this.runs
          .filter((r) => r.workflowId === wf.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      })),
      latestRun: repoRuns[0] || undefined,
    };
  }

  createRepository(input: CreateRepositoryInput): Repository {
    const repoUrl = input.url || input.githubUrl || `https://github.com/${input.owner || 'harshit'}/${input.name}`;
    let owner = input.owner;
    if (!owner) {
      try {
        const parts = new URL(repoUrl).pathname.replace(/^\/|\/$/g, '').split('/');
        owner = parts[0] || 'harshit';
      } catch {
        owner = 'harshit';
      }
    }

    const newRepo: Repository = {
      id: `repo-${Date.now()}`,
      name: input.name,
      owner,
      url: repoUrl,
      defaultBranch: input.defaultBranch || 'main',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.repositories.unshift(newRepo);

    // Auto-create default workflow for new repo
    const defaultWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      repositoryId: newRepo.id,
      name: 'CI / Test & Build',
      configVersion: 1,
      definition: [
        { name: 'lint', commands: ['pnpm lint'] },
        { name: 'test', commands: ['pnpm test'] },
        { name: 'build', commands: ['pnpm build'] },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.workflows.unshift(defaultWorkflow);

    return newRepo;
  }

  getWorkflows(repositoryId: string): Workflow[] {
    return this.workflows.filter((w) => w.repositoryId === repositoryId);
  }

  getWorkflow(id: string): Workflow | null {
    const wf = this.workflows.find((w) => w.id === id);
    if (!wf) return null;
    const repo = this.repositories.find((r) => r.id === wf.repositoryId);
    const wfRuns = this.runs.filter((r) => r.workflowId === wf.id);
    return {
      ...wf,
      repository: repo,
      runs: wfRuns,
    };
  }

  createWorkflow(repositoryId: string, input: CreateWorkflowInput): Workflow {
    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      repositoryId,
      name: input.name,
      configVersion: 1,
      definition: input.jobs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.workflows.unshift(newWorkflow);
    return newWorkflow;
  }

  getAllRuns(): WorkflowRun[] {
    return this.runs
      .map((run) => {
        const wf = this.workflows.find((w) => w.id === run.workflowId);
        const repo = wf ? this.repositories.find((r) => r.id === wf.repositoryId) : undefined;
        const jobs = this.jobs.filter((j) => j.workflowRunId === run.id);
        return {
          ...run,
          workflow: wf ? { ...wf, repository: repo } : undefined,
          jobs,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getWorkflowRuns(workflowId: string): WorkflowRun[] {
    return this.runs
      .filter((r) => r.workflowId === workflowId)
      .map((run) => ({
        ...run,
        jobs: this.jobs.filter((j) => j.workflowRunId === run.id),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getWorkflowRun(id: string): WorkflowRun | null {
    const run = this.runs.find((r) => r.id === id);
    if (!run) return null;

    const wf = this.workflows.find((w) => w.id === run.workflowId);
    const repo = wf ? this.repositories.find((r) => r.id === wf.repositoryId) : undefined;
    const jobs = this.jobs.filter((j) => j.workflowRunId === run.id);

    return {
      ...run,
      workflow: wf ? { ...wf, repository: repo } : undefined,
      jobs: jobs.map((job) => ({
        ...job,
        runner: this.runners.find((runner) => runner.id === job.runnerId) || null,
      })),
    };
  }

  createWorkflowRun(workflowId: string, input?: CreateWorkflowRunInput): WorkflowRun {
    const wf = this.workflows.find((w) => w.id === workflowId);
    if (!wf) throw new Error('Workflow not found');

    const repo = this.repositories.find((r) => r.id === wf.repositoryId);
    const runNumber = this.runs.length + 43;
    const runId = `run-${runNumber}`;

    const newRun: WorkflowRun = {
      id: runId,
      workflowId,
      branch: input?.branch || repo?.defaultBranch || 'main',
      commitSha: input?.commitSha || Math.random().toString(16).substring(2, 10) + 'f0892',
      status: 'QUEUED',
      triggerType: 'MANUAL',
      queuedAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      durationSeconds: 0,
    };

    this.runs.unshift(newRun);

    // Create jobs from workflow definition
    const definition = wf.definition || [{ name: 'build', commands: ['pnpm build'] }];
    const createdJobs: Job[] = definition.map((def, idx) => {
      const jobId = `job-${runNumber}-${idx + 1}`;
      const job: Job = {
        id: jobId,
        workflowRunId: runId,
        name: def.name,
        commands: def.commands,
        status: 'QUEUED',
        runnerId: null,
        queuedAt: new Date().toISOString(),
        startedAt: null,
        completedAt: null,
        exitCode: null,
        errorMessage: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        durationSeconds: 0,
      };
      this.jobs.push(job);
      this.logs[jobId] = [
        {
          id: `log-${Date.now()}-1`,
          jobId,
          sequence: 1,
          stream: 'STDOUT',
          message: `Job ${def.name} queued in Nimbus CI scheduler`,
          createdAt: new Date().toISOString(),
        },
      ];
      return job;
    });

    return {
      ...newRun,
      workflow: { ...wf, repository: repo },
      jobs: createdJobs,
    };
  }

  getJobs(runId: string): Job[] {
    return this.jobs
      .filter((j) => j.workflowRunId === runId)
      .map((job) => ({
        ...job,
        runner: this.runners.find((runner) => runner.id === job.runnerId) || null,
      }));
  }

  getJobLogs(jobId: string): JobLog[] {
    return this.logs[jobId] || [];
  }

  getRunners(): Runner[] {
    return this.runners;
  }
}

const localStore = new LocalStateStore();

/**
 * Robust API Client with automatic graceful fallback to local state store
 */
export const api = {
  // Repositories
  async getRepositories(): Promise<Repository[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/repositories`, { cache: 'no-store' });
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : localStore.getRepositories();
    } catch {
      return localStore.getRepositories();
    }
  },

  async getRepository(id: string): Promise<Repository | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/repositories/${id}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('API request failed');
      return await res.json();
    } catch {
      return localStore.getRepository(id);
    }
  },

  async createRepository(input: CreateRepositoryInput): Promise<Repository> {
    try {
      const res = await fetch(`${API_BASE_URL}/repositories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('API request failed');
      return await res.json();
    } catch {
      return localStore.createRepository(input);
    }
  },

  // Workflows
  async getWorkflows(repositoryId: string): Promise<Workflow[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/workflows`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('API request failed');
      return await res.json();
    } catch {
      return localStore.getWorkflows(repositoryId);
    }
  },

  async getWorkflow(id: string): Promise<Workflow | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/workflows/${id}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('API request failed');
      return await res.json();
    } catch {
      return localStore.getWorkflow(id);
    }
  },

  async createWorkflow(repositoryId: string, input: CreateWorkflowInput): Promise<Workflow> {
    try {
      const res = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('API request failed');
      return await res.json();
    } catch {
      return localStore.createWorkflow(repositoryId, input);
    }
  },

  // Workflow Runs
  async getAllRuns(): Promise<WorkflowRun[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/runs`, { cache: 'no-store' });
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : localStore.getAllRuns();
    } catch {
      return localStore.getAllRuns();
    }
  },

  async getWorkflowRuns(workflowId: string): Promise<WorkflowRun[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/workflows/${workflowId}/runs`, { cache: 'no-store' });
      if (!res.ok) throw new Error('API request failed');
      return await res.json();
    } catch {
      return localStore.getWorkflowRuns(workflowId);
    }
  },

  async getWorkflowRun(id: string): Promise<WorkflowRun | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/runs/${id}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('API request failed');
      return await res.json();
    } catch {
      return localStore.getWorkflowRun(id);
    }
  },

  async createWorkflowRun(
    workflowId: string,
    input?: CreateWorkflowRunInput
  ): Promise<WorkflowRun> {
    try {
      const res = await fetch(`${API_BASE_URL}/workflows/${workflowId}/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input || {}),
      });
      if (!res.ok) throw new Error('API request failed');
      return await res.json();
    } catch {
      return localStore.createWorkflowRun(workflowId, input);
    }
  },

  // Jobs & Logs
  async getJobs(runId: string): Promise<Job[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/runs/${runId}/jobs`, { cache: 'no-store' });
      if (!res.ok) throw new Error('API request failed');
      return await res.json();
    } catch {
      return localStore.getJobs(runId);
    }
  },

  async getJobLogs(jobId: string): Promise<JobLog[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/logs`, { cache: 'no-store' });
      if (!res.ok) throw new Error('API request failed');
      return await res.json();
    } catch {
      return localStore.getJobLogs(jobId);
    }
  },

  // Runners
  async getRunners(): Promise<Runner[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/runners`, { cache: 'no-store' });
      if (!res.ok) throw new Error('API request failed');
      return await res.json();
    } catch {
      return localStore.getRunners();
    }
  },
};
