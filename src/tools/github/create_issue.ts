import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createIssue } from "../../clients/github/issues.js";
import { createIssueOutputSchema, createIssueSchema } from "../../schemas/issues.schema.js";
import { toolFailure, toolSuccess, toolValidationFailure } from "./result.js";
import type { GithubClient } from "../../clients/github.client.js";

export function registerCreateIssue(server: McpServer, githubClient: GithubClient) {
    server.registerTool(
        "create_issue",
        {
            description: "Crea una issue en un repositorio accesible por la cuenta autenticada.",
            inputSchema: createIssueSchema.shape,
            outputSchema: createIssueOutputSchema,
        },
        async (args) => {
            const parsed = createIssueSchema.safeParse(args);
            if (!parsed.success) {
                return toolValidationFailure(
                    parsed.error.issues.map((issue) => issue.message).join("; "),
                    parsed.error.issues,
                );
            }

            try {
                const { owner, repo, title, body: issueBody, labels, assignees } = parsed.data;
                const data = await createIssue(githubClient, owner, repo, title, issueBody, labels, assignees);
                return toolSuccess(data);
            } catch (error) {
                return toolFailure(error);
            }
        },
    );
}
