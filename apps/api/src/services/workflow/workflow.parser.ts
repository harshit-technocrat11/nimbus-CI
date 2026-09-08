import YAML from "yaml";

export interface ParsedJob {
  name: string;
  image: string;
  env?: Record<string, string> | undefined;
  steps: string[];
}

export interface ParsedWorkflow {
  name?: string | undefined;
  jobs: ParsedJob[];
}

// normalize the payload - yaml
export class WorkflowParserService {
  parse(content: string): ParsedWorkflow {
  
    const normalized = content
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();

    console.log("\n[Parser] Parsing Workflow YAML...");

    let parsed: any;
    try {
      parsed = YAML.parse(normalized);
    } catch (err: any) {
      console.error("\n❌ [Parser] YAML Syntax Error:", err.message);
      console.error("--- Raw Content ---");
      console.error(normalized);
      console.error("-------------------\n");
      throw new Error(`YAML syntax error: ${err.message}`);
    }

    if (!parsed || typeof parsed !== "object" || !parsed.jobs) {
      throw new Error("Invalid workflow YAML: 'jobs' section is required.");
    }

    const jobs: ParsedJob[] = [];

    for (const [jobName, jobConfig] of Object.entries<any>(parsed.jobs)) {
      if (!jobConfig || typeof jobConfig !== "object") continue;

      const image = jobConfig.image || "node:22";
      const rawSteps = jobConfig.steps || jobConfig.commands || [];

      const steps: string[] = rawSteps
        .map((s: any) => (typeof s === "string" ? s : s?.run || s?.command || ""))
        .filter(Boolean);

      if (steps.length === 0) {
        throw new Error(`Job "${jobName}" must contain at least one step.`);
      }

      // Extract job-level environment variables
      let env: Record<string, string> | undefined;
      if (jobConfig.env && typeof jobConfig.env === "object") {
        env = {};
        for (const [key, val] of Object.entries(jobConfig.env)) {
          env[key] = String(val);
        }
      }

      console.log(
        `  ⚙️  Parsed Job: [${jobName}] (image: ${image}, steps: ${steps.length}, env keys: ${
          env ? Object.keys(env).join(", ") : "none"
        })`
      );

      jobs.push({
        name: jobName,
        image,
        env,
        steps,
      });
    }

    console.log(`✅ [Parser] Successfully parsed ${jobs.length} jobs (Workflow name: "${parsed.name || "unnamed"}")\n`);

    return {
      name: parsed.name,
      jobs,
    };
  }
}

export const workflowParser = new WorkflowParserService();
export const parseWorkflow = (content: string) => workflowParser.parse(content);
