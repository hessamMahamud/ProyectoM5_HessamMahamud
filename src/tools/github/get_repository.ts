import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GithubClient } from "../../clients/github.client.js";
import { toolFailure, toolSuccess, toolValidationFailure } from "./result.js";
import { getRepository } from "../../clients/github/repositories.js";
import { getRepositorySchema, getRepositoryOutputSchema } from "../../schemas/repositories.schema.js";

export function registerGetRepository(server: McpServer, githubClient: GithubClient) {
    server.registerTool(
        "get_repository",
        {
            description: "Obtiene información sobre un solo repositorio.",
            inputSchema: getRepositorySchema.shape,
            outputSchema: getRepositoryOutputSchema.shape,
        },
        async (args) => {
            const parsed = getRepositorySchema.safeParse(args);

            if (!parsed.success) {
                return toolValidationFailure(
                    parsed.error.issues.map((issue) => issue.message).join("; "),
                    parsed.error.issues,
                );
            }

            try {
                const { owner, repo } = parsed.data;
                const data = await getRepository(githubClient, owner, repo);
                return toolSuccess(data);

            } catch(error) {
                return toolFailure(error);
            }
        },
    );
}
