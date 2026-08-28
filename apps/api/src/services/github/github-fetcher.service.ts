import { logger } from "@nimbus-ci/logger";

const WORKFLOW_PATHS = [
  ".nimbus/workflows/nimbus-ci.yml",
  ".nimbus/ci.yml",
  "nimbus-ci.yml",
  ".nimbus.yml",
];

export interface FetchWorkflowResult {
  content: string;
  path: string;
}

export function parseGitHubRepoInfo(url: string) {
  const clean = url
    .replace(/\.git$/, "")
    .replace(/^https?:\/\/github\.com\//, "");

  const [owner, repo] = clean.split("/");
  if (!owner || !repo) return null;

  return { owner, repo };
}

// Fetches the workflow file from GitHub at the exact commit SHA
export async function fetchWorkflowFromGitHub(
  owner: string,
  repo: string,
  commitSha: string
): Promise<FetchWorkflowResult | null> {
  for (const path of WORKFLOW_PATHS) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${commitSha}/${path}`;

    try {
      console.log(`   🔎 Checking: ${path}...`);
      const res = await fetch(url);
      if (res.ok) {
        const content = await res.text();
        console.log(`   📥 Found workflow at: ${path} (commit: ${commitSha.substring(0, 7)})`);
        return { content, path };
      }
    } catch (err: any) {
      console.warn(`   ⚠️  Failed to fetch ${url}: ${err.message}`);
    }
  }

  return null;
}
