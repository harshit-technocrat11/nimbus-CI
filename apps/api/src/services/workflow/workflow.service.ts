import { prisma } from "@nimbus-ci/db";
import { logger } from "@nimbus-ci/logger";
import type { ExecuteJobPayload } from "@nimbus-ci/queue";
import type { CreateWorkflowInput } from "../../schemas/workflow.schema.js";
import { parseWorkflow, type ParsedWorkflow } from "./workflow.parser.js";
import { createPipeline } from "../pipeline/pipeline.service.js";
import { createJobs } from "../pipeline/job.service.js";
import { jobEnqueuerService } from "./job-enqueuer.service.js";
import {
  fetchWorkflowFromGitHub,
  parseGitHubRepoInfo,
} from "../github/github-fetcher.service.js";

export interface RunWorkflowInput {
  workflowContent: string;
  workflowId: string;
  repositoryUrl: string;
  branch: string;
  commitSha?: string;
  triggerType?: "MANUAL";
}

export class WorkflowService {
  async runWorkflow(input: RunWorkflowInput) {
    logger.info("[Workflow] Parsing workflow");
    const parsed: ParsedWorkflow = parseWorkflow(input.workflowContent);
    logger.info(`[Workflow] Parsed ${parsed.jobs.length} jobs`);

    const pipeline = await createPipeline({
      workflowId: input.workflowId,
      branch: input.branch,
      commitSha: input.commitSha ?? null,
      triggerType: input.triggerType ?? "MANUAL",
    });
    logger.info(`[Pipeline] Created pipeline <${pipeline.id}>`);

    // persist
    const dbJobs = await createJobs(
      pipeline.id,
      parsed.jobs.map((job) => ({
        name: job.name,
        steps: job.steps,
      })),
    );

    for (const job of dbJobs) {
      logger.info(`[Job] Created ${job.name} <${job.id}>`);
    }

    
    const queuePayloads: ExecuteJobPayload[] = dbJobs.map((dbJob) => {
      const parsedJob = parsed.jobs.find((j) => j.name === dbJob.name);
      return {
        pipelineId: pipeline.id,
        jobId: dbJob.id,
        repositoryUrl: input.repositoryUrl,
        commitSha: input.commitSha ?? "HEAD",
        name: dbJob.name,
        image: parsedJob?.image || "node:22",
        env: parsedJob?.env,
        steps: parsedJob?.steps || [],
      };
    });

    // Bulk enqueue jobs to BullMQ
    try {
      await jobEnqueuerService.enqueueJobs(queuePayloads);
    } catch (error) {
      logger.error("Failed to bulk enqueue jobs to BullMQ", {
        error,
        pipelineId: pipeline.id,
      });
    }

    return {
      pipeline,
      jobs: dbJobs,
      parsedWorkflow: parsed,
    };
  }

  async runWorkflowById(
    workflowId: string,
    options?: {
      branch?: string;
      commitSha?: string;
    },
  ) {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { repository: true },
    });

    if (!workflow) {
      throw new Error("Workflow not found");
    }

    const branch =
      options?.branch || workflow.repository.defaultBranch || "main";
    const commitSha = options?.commitSha || "HEAD";

    let workflowYaml: string | undefined;

    // If we have a commit SHA, try to fetch the live YAML from GitHub first
    if (commitSha && commitSha !== "HEAD" && workflow.repository?.url) {
      const repoInfo = parseGitHubRepoInfo(workflow.repository.url);
      if (repoInfo) {
        const fetched = await fetchWorkflowFromGitHub(
          repoInfo.owner,
          repoInfo.repo,
          commitSha,
        );
        if (fetched) {
          workflowYaml = fetched.content;
          logger.info(
            `[Workflow] Using dynamically fetched workflow from GitHub at commit ${commitSha}`,
          );
        }
      }
    }

    // Fallback to definition stored in database
    if (!workflowYaml) {
      if (typeof workflow.definition === "string") {
        workflowYaml = workflow.definition;
      } else {
        const def = workflow.definition as any;
        const jobsList = Array.isArray(def) ? def : (def?.jobs ?? []);
        const jobsObj: Record<string, any> = {};

        for (const j of jobsList) {
          jobsObj[j.name] = {
            image: j.image || "node:22",
            steps: j.steps ?? j.commands ?? [],
          };
        }

        workflowYaml =
          `name: ${workflow.name}\njobs:\n` +
          Object.entries(jobsObj)
            .map(
              ([name, cfg]) =>
                `  ${name}:\n    image: "${cfg.image}"\n    steps:\n` +
                cfg.steps.map((s: string) => `      - "${s}"`).join("\n"),
            )
            .join("\n");
      }
    }

    return this.runWorkflow({
      workflowContent: workflowYaml,
      workflowId: workflow.id,
      repositoryUrl: workflow.repository.url,
      branch,
      commitSha,
    });
  }

  async createWorkflow(repositoryId: string, data: CreateWorkflowInput) {
    return prisma.workflow.create({
      data: {
        name: data.name,
        definition: data.jobs as any,
        repositoryId,
      },
    });
  }

  async getWorkflowsByRepository(repositoryId: string) {
    return prisma.workflow.findMany({
      where: { repositoryId },
      include: {
        runs: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getWorkflowById(id: string) {
    return prisma.workflow.findUnique({
      where: { id },
      include: {
        repository: true,
        runs: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }
}

export const workflowService = new WorkflowService();
export const createWorkflow = (repoId: string, data: CreateWorkflowInput) =>
  workflowService.createWorkflow(repoId, data);
export const getWorkflowsByRepository = (repoId: string) =>
  workflowService.getWorkflowsByRepository(repoId);
export const getWorkflowById = (id: string) =>
  workflowService.getWorkflowById(id);
export const createWorkflowRun = async (
  workflowId: string,
  input?: { branch?: string; commitSha?: string },
) => {
  const result = await workflowService.runWorkflowById(workflowId, input);
  return result.pipeline;
};
