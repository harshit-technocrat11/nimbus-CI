import { docker } from "./client";

export type ExecuteJobOptions = {
  image: string;
  steps: string[];
};

export type StepResult = {
  step: string;
  exitCode: number;
};

export type JobExecutionResult = {
  success: boolean;
  steps: StepResult[];
};

export async function executeJob({
  image,
  steps,
}: ExecuteJobOptions): Promise<JobExecutionResult> {
  console.log(`Starting container with image: ${image}`);

  const container = await docker.createContainer({
    Image: image,
    Cmd: ["tail", "-f", "/dev/null"],
    Tty: false,
    OpenStdin: false,
  });

  const results: StepResult[] = [];

  try {
    await container.start();

    for (const [index, step] of steps.entries()) {
      console.log(`\n▶️ Step ${index + 1}: ${step}`);

      const exec = await container.exec({
        Cmd: ["sh", "-c", step],
        AttachStdout: true,
        AttachStderr: true,
      });

      const stream = await exec.start({
        hijack: true,
        stdin: false,
      });

      stream.on("data", (chunk: Buffer) => {
        process.stdout.write(chunk);
      });

      await new Promise<void>((resolve, reject) => {
        stream.on("end", resolve);
        stream.on("error", reject);
      });

      const inspection = await exec.inspect();

      const exitCode = inspection.ExitCode ?? 1;

      results.push({
        step,
        exitCode,
      });

      if (exitCode !== 0) {
        console.log(`❌ Step failed with exit code ${exitCode}`);

        return {
          success: false,
          steps: results,
        };
      }

      console.log(`✅ Step completed`);
    }

    return {
      success: true,
      steps: results,
    };
  } finally {
    console.log("\n Removing container...");

    try {
      await container.remove({
        force: true,
      });
    } catch (error) {
      console.error("Failed to remove container:", error);
    }
  }
}
