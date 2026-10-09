import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listIssues } from "../../clients/gh.issues.client.js";
import { listIssuesOutputSchema, listIssuesSchema } from "../../schemas/issues.schema.js";
import { toolFailure, toolSuccess, toolValidationFailure } from "./result.js";
import type { GithubClient } from "../../clients/github.client.js";

export function registerListIssues(server: McpServer, githubClient: GithubClient) {
    server.registerTool(
        "list_issues",
        {
            description: "Lista las issues de un repositorio y excluye pull requests de la respuesta.",
            inputSchema: listIssuesSchema.shape,
            outputSchema: listIssuesOutputSchema,
        },
        async (args) => {
            const parsed = listIssuesSchema.safeParse(args);
            if (!parsed.success) {
                return toolValidationFailure(
                    parsed.error.issues.map((issue) => issue.message).join("; "),
                    parsed.error.issues,
                );
            }

            try {
                const { owner, repo, state, sort, direction, per_page, page } = parsed.data;
                const data = await listIssues(githubClient, owner, repo, state, sort, direction, per_page, page);
                return toolSuccess(data);
            } catch (error) {
                return toolFailure(error);
            }
        },
    );
}
