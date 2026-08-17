import { docker } from "./client";

export async function executeCommand(image: string, command: string) {
  console.log(`Using image: ${image}`);
  console.log(`Executing: ${command}`);

  const container = await docker.createContainer({
    Image: image,
    Cmd: ["sh", "-c", command],
    Tty: false,
  });

  try {
    await container.start();

    const stream = await container.logs({
      stdout: true,
      stderr: true,
      follow: true,
    });

    return new Promise<void>((resolve, reject) => {
      stream.on("data", (chunk: Buffer) => {
        process.stdout.write(chunk);
      });

      stream.on("end", async () => {
        try {
          await container.remove();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      stream.on("error", reject);
    });
  } catch (error) {
    try {
      await container.remove({ force: true });
    } catch {}

    throw error;
  }
}
