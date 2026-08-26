export interface GitHubRepositoryPayload {
  name: string;
  full_name: string;
  clone_url: string;
  html_url?: string;
  default_branch?: string;
  owner?: {
    name?: string;
    login?: string;
  };
}

export interface GitHubPushPayload {
  ref?: string;
  after?: string;
  before?: string;
  repository?: GitHubRepositoryPayload;
  head_commit?: {
    id: string;
    message?: string;
  };
}

export interface ExtractedPushInfo {
  repoUrl: string;
  repoName: string;
  owner: string;
  branch: string;
  commitSha: string;
}
