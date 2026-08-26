import { WorkflowParserService } from "./services/workflow-parser.service";
import { WorkflowJobEnqueuerService } from "./services/workflow-job-enqueuer.service";
import { WorkflowRunnerService } from "./services/workflow-runner.service";

const parser = new WorkflowParserService();

const enqueuer =
  new WorkflowJobEnqueuerService();

const runner =
  new WorkflowRunnerService(
    parser,
    enqueuer,
  );

const workflow = `
name: Test CI

jobs:
  test:
    image: node:22
    steps:
      - npm install
      - npm test

  build:
    image: node:22
    steps:
      - npm run build
`;

async function main() {
  await runner.run({
    workflowContent: workflow,

    pipelineId: "pipeline-test-1",

    repositoryUrl:
      "https://github.com/test/test-repo",

    commitSha: "abc123",
  });

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});