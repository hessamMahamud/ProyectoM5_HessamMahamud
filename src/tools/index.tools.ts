import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCreateRepository } from "./github/create_repository.js";
import { registerPing } from "./ping.js";
import { registerCreateIssue } from "./github/create_issue.js";
import { registerCreateCommit } from "./github/create_commit.js";
import { registerListIssues } from "./github/list_issues.js";
import { createGithubClient, type GithubClient } from "../clients/github.client.js";

export function registerAllTools(server: McpServer, githubClient: GithubClient = createGithubClient()) {
    registerCreateRepository(server, githubClient);
    registerCreateIssue(server, githubClient);
    registerCreateCommit(server, githubClient);
    registerListIssues(server, githubClient);
    registerPing(server);
}
