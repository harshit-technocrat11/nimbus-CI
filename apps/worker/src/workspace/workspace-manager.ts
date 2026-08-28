import fs from "node:fs/promises";
import path from "node:path";

const WORKSPACE_ROOT = path.resolve(
  process.env.WORKSPACE_ROOT || "./workspaces"
);

export class WorkspaceManager {
    
  async create(jobId: string): Promise<string> {
    const workspacePath = path.join(WORKSPACE_ROOT, jobId);

    await fs.mkdir(workspacePath, {
      recursive: true,
    });

    return workspacePath;
  }

  async cleanup(jobId: string): Promise<void> {
    const workspacePath = path.join(WORKSPACE_ROOT, jobId);

    await fs.rm(workspacePath, {
      recursive: true,
      force: true,
    });
  }
}

export const workspaceManager = new WorkspaceManager();