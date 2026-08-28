import { docker } from "./client";

export type ExecuteJobOptions = {
  image: string;
  steps: string[];
  workspacePath: string,
};

export type StepResult = {
  step: string;
  exitCode: number;
};

export type JobExecutionResult = {
  success: boolean;
  steps: StepResult[];
};


// create container instance

async function createContainer(
  image: string,
  workspacePath: string
) {
  return docker.createContainer({
    Image: image,

    Cmd: ["tail", "-f", "/dev/null"],

    Tty: false,
    OpenStdin: false,

    WorkingDir: "/workspace",

    HostConfig: {
      Binds: [
        `${workspacePath}:/workspace`,
      ],
    },
  });
}


async function executeStep(
  container: any,
  step: string
): Promise<number> {
  console.log(`\n▶️ Step: ${step}`);

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

  return inspection.ExitCode ?? 1;
}

// execute and clean up

export async function executeJob({
  image,
  steps,
  workspacePath,
}: ExecuteJobOptions): Promise<JobExecutionResult> {

  console.log(
    `Starting container with image: ${image}`
  );

  const container = await createContainer(
    image,
    workspacePath
  );

  const results: StepResult[] = [];

  try {
    await container.start();

    for (const step of steps) {
      const exitCode = await executeStep(
        container,
        step
      );

      results.push({
        step,
        exitCode,
      });

      if (exitCode !== 0) {
        console.log(
          `❌ Step failed with exit code ${exitCode}`
        );

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
    console.log("\n🧹 Removing container...");

    try {
      await container.remove({
        force: true,
      });
    } catch (error) {
      console.error(
        "Failed to remove container:",
        error
      );
    }
  }
}