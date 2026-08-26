import YAML from "yaml";

export interface WorkflowStep {
  command: string;
}

export interface ParsedJob {
  name: string;
  image: string;
  steps: WorkflowStep[];
}

export interface ParsedWorkflow {
  name?: string;
  jobs: ParsedJob[];
}

export class WorkflowParserService {
  parse(content: string): ParsedWorkflow {
    const workflow = YAML.parse(content);

    if (!workflow || typeof workflow !== "object") {
      throw new Error("Invalid nimbus-ci.yml");
    }

    if (!workflow.jobs || typeof workflow.jobs !== "object") {
      throw new Error("Workflow must contain jobs");
    }

    const jobs: ParsedJob[] = [];

    for (const [jobName, jobConfig] of Object.entries(workflow.jobs)) {
      if (!jobConfig || typeof jobConfig !== "object") {
        throw new Error(`Invalid configuration for job: ${jobName}`);
      }

      const config = jobConfig as Record<string, unknown>;

      const image = config.image;

      if (typeof image !== "string") {
        throw new Error(`Job "${jobName}" must specify an image`);
      }

      const rawSteps = config.steps;

      if (!Array.isArray(rawSteps)) {
        throw new Error(`Job "${jobName}" must contain steps`);
      }

      const steps: WorkflowStep[] = rawSteps.map((step) => {
        if (typeof step !== "string") {
          throw new Error(
            `Every step in job "${jobName}" must be a command string`,
          );
        }

        return {
          command: step,
        };
      });

      jobs.push({
        name: jobName,
        image,
        steps,
      });
    }

    return {
      name:
        typeof workflow.name === "string"
          ? workflow.name
          : undefined,
      jobs,
    };
  }
}