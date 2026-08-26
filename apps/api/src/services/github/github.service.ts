import type { GitHubPushPayload, ExtractedPushInfo } from "./github.types.js";

export class GitHubService {
  extractPushInfo(payload: GitHubPushPayload): ExtractedPushInfo | null {
    const repository = payload.repository;
    const branch = payload.ref?.replace("refs/heads/", "");
    const commitSha = payload.after || payload.head_commit?.id;

    if (!repository?.clone_url || !branch || !commitSha) {
      return null;
    }

    const repoUrl = repository.clone_url;
    const repoName = repository.name || repository.full_name;
    const owner = repository.owner?.login || repository.owner?.name || "unknown";

    return {
      repoUrl,
      repoName,
      owner,
      branch,
      commitSha,
    };
  }
}

export const githubService = new GitHubService();
