import { WorkflowParserService } from "./workflow-parser.service";
import { WorkflowJobEnqueuerService } from "./workflow-job-enqueuer.service";

interface RunWorkflowInput {
  workflowContent: string;

  pipelineId: string;

  repositoryUrl: string;

  commitSha: string;
}

export class WorkflowRunnerService {
  constructor(
    private readonly parser: WorkflowParserService,
    private readonly enqueuer: WorkflowJobEnqueuerService,
  ) {}

  async run(input: RunWorkflowInput) {
    console.log("[Workflow] Parsing nimbus-ci.yml");

    const workflow = this.parser.parse(
      input.workflowContent,
    );

    console.log(
      `[Workflow] Found ${workflow.jobs.length} jobs`,
    );

    const queuePayloads = workflow.jobs.map((job) => ({
      pipelineId: input.pipelineId,

      jobId: `${input.pipelineId}:${job.name}`,

      repositoryUrl: input.repositoryUrl,

      commitSha: input.commitSha,

      name: job.name,

      image: job.image,

      steps: job.steps,
    }));

    await this.enqueuer.enqueueJobs(queuePayloads);

    console.log(
      `[Workflow] Enqueued ${queuePayloads.length} jobs`,
    );

    return workflow;
  }
}