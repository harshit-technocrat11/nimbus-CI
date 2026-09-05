import { docker } from "./client.js";

export type ExecuteJobOptions = {
  image: string;
  steps: string[];
  env?: Record<string, string>;
  workspacePath: string;
  onLog?: (log: string) => void | Promise<void>;
};

export type StepResult = {
  step: string;
  exitCode: number;
};

export type JobExecutionResult = {
  success: boolean;
  steps: StepResult[];
};

// if image doesnt exist locally , pull it
async function ensureImage(image: string): Promise<void> {
  try {
    await docker.getImage(image).inspect();

    console.log(`📦Image already available: ${image}`);
  } catch {
    console.log(`📥Pulling Docker image: ${image}`);

    const stream = await docker.pull(image);

    await new Promise<void>((resolve, reject) => {
      docker.modem.followProgress(
        stream,
        (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        },
      );
    });

    console.log(`✅ Image pulled: ${image}`);
  }
}


// create container instance

async function createContainer(
  image: string,
  workspacePath: string,
  env?: Record<string, string>
) {
  // passing the env variables in string format
  const envArray = env
    ? Object.entries(env).map(([key, val]) => `${key}=${val}`)
    : [];

  return docker.createContainer({
    Image: image,

    Cmd: ["tail", "-f", "/dev/null"],

    Tty: false,
    OpenStdin: false,

    WorkingDir: "/workspace",

    Env: envArray,

    HostConfig: {
      Binds: [
        `${workspacePath}:/workspace`,
      ],
    },
  });
}


async function executeStep(
  container: any,
  step: string,
  onLog?: (log: string) => void | Promise<void>

): Promise<number> {

  const stepHeader = `\n▶️ Step: ${step}\n`;
  console.log(stepHeader);
  if (onLog) await onLog(stepHeader);

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
    const text = chunk.toString();
    process.stdout.write(text);
    if (onLog) {
      onLog(text);
    }
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
  env,
  workspacePath,
  onLog,
}: ExecuteJobOptions): Promise<JobExecutionResult> {

  // ensure image is available locally 
  await ensureImage(image);

  console.log(
    `Starting container with image: ${image}`
  );

  const container = await createContainer(
    image,
    workspacePath,
    env
  );

  const results: StepResult[] = [];

  try {
    await container.start();

    for (const step of steps) {
      const exitCode = await executeStep(container, step, onLog);

      results.push({ step, exitCode });
      if (exitCode !== 0) {
        const failMsg = `\n❌ Step failed with exit code ${exitCode}\n`;
        console.log(failMsg);
        if (onLog) await onLog(failMsg);
        return { success: false, steps: results };
      }
      const successMsg = `✅ Step completed\n`;
      console.log(successMsg);
      if (onLog) await onLog(successMsg);
    }
    return { success: true, steps: results };
  } finally {
    console.log("\nRemoving container...");

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