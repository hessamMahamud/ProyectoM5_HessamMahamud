import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCreateRepository } from "./github/create_repository.js";
import { registerCreateCommit } from "./github/create_commit.js";
import { registerPing } from "./ping.js";
import { registerCreateIssue } from "./github/create_issue.js";
import { registerListIssues } from "./github/list_issues.js";
import { registerListRepositories } from "./github/list_repositories.js";
import { registerReadFile } from "./github/read_file.js";
import { createGithubClient, type GithubClient } from "../clients/github.client.js";
import { registerGetRepository } from "./github/get_repository.js";

export function registerAllTools(server: McpServer, githubClient: GithubClient = createGithubClient()) {
    registerCreateRepository(server, githubClient);
    registerCreateIssue(server, githubClient);
    registerCreateCommit(server, githubClient);
    registerListIssues(server, githubClient);
    registerListRepositories(server, githubClient);
    registerReadFile(server, githubClient);
    registerGetRepository(server, githubClient);
    registerPing(server);
}
