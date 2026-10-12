import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createCommit } from "../../clients/github/commits.js";
import { createCommitOutputSchema, createCommitSchema } from "../../schemas/commit.schema.js";
import { toolFailure, toolSuccess, toolValidationFailure } from "./result.js";
import type { GithubClient } from "../../clients/github.client.js";

export function registerCreateCommit(server: McpServer, githubClient: GithubClient) {
    server.registerTool(
        "create_commit",
        {
            description: "Crea o actualiza un archivo mediante un commit en un repositorio.",
            inputSchema: createCommitSchema.shape,
            outputSchema: createCommitOutputSchema,
        },
        async (args) => {
            const parsed = createCommitSchema.safeParse(args);
            if (!parsed.success) {
                return toolValidationFailure(
                    parsed.error.issues.map((issue) => issue.message).join("; "),
                    parsed.error.issues,
                );
            }

            try {
                const { owner, repo, message, content, path, branch, sha } = parsed.data;
                const data = await createCommit(githubClient, owner, repo, message, content, path, branch, sha);
                return toolSuccess(data);
            } catch (error) {
                return toolFailure(error);
            }
        },
    );
}
