import { spawn } from "node:child_process";

function runGit(args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn("git", args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("error", reject);

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `Git command failed: git ${args.join(" ")}\n${stderr}`
        )
      );
    });
  });
}

export class GitManager {
  async checkout(
    repositoryUrl: string,
    commitSha: string,
    workspacePath: string
  ): Promise<void> {
    console.log(
      `[Git] Cloning ${repositoryUrl} at ${commitSha}`
    );

    await runGit(["init"], workspacePath);

    await runGit(
      ["remote", "add", "origin", repositoryUrl],
      workspacePath
    );

    // just fetch the, commit that was triggered, rather thanwhole hist
    await runGit(
      ["fetch", "--depth", "1", "origin", commitSha],
      workspacePath
    );

    await runGit(
      ["checkout", "--detach", "FETCH_HEAD"],
      workspacePath
    );

    console.log(
      `[Git] Checkout complete: ${commitSha}`
    );
  }
}

export const gitManager = new GitManager();