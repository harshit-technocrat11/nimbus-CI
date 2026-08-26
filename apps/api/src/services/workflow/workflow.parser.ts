import YAML from "yaml";

export interface ParsedJob {
  name: string;
  image: string;
  steps: string[];
}

export interface ParsedWorkflow {
  name?: string;
  jobs: ParsedJob[];
}

export class WorkflowParserService {
  parse(content: string): ParsedWorkflow {
    const workflow = YAML.parse(content);

    if (!workflow || typeof workflow !== "object") {
      throw new Error("Invalid nimbus-ci.yml definition");
    }

    if (!workflow.jobs || typeof workflow.jobs !== "object") {
      throw new Error("Workflow must contain 'jobs'");
    }

    const jobs: ParsedJob[] = [];

    for (const [jobName, jobConfig] of Object.entries(workflow.jobs)) {
      if (!jobConfig || typeof jobConfig !== "object") {
        throw new Error(`Invalid configuration for job: ${jobName}`);
      }

      const config = jobConfig as Record<string, unknown>;

      const image = typeof config.image === "string" ? config.image : "node:22";

      const rawSteps = config.steps ?? config.commands;

      if (!Array.isArray(rawSteps) || rawSteps.length === 0) {
        throw new Error(`Job "${jobName}" must contain at least one step`);
      }

      const steps: string[] = rawSteps.map((step) => {
        if (typeof step === "string") {
          return step;
        }
        if (step && typeof step === "object" && "command" in step && typeof (step as any).command === "string") {
          return (step as any).command;
        }
        if (step && typeof step === "object" && "run" in step && typeof (step as any).run === "string") {
          return (step as any).run;
        }
        throw new Error(`Step in job "${jobName}" must be a command string`);
      });

      jobs.push({
        name: jobName,
        image,
        steps,
      });
    }

    return {
      name: typeof workflow.name === "string" ? workflow.name : undefined,
      jobs,
    };
  }
}

export const workflowParser = new WorkflowParserService();
export const parseWorkflow = (content: string) => workflowParser.parse(content);
