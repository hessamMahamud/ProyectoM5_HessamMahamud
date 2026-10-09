import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listRepos } from "../../clients/gh.repositories.client.js";
import type { GithubClient } from "../../clients/github.client.js";
import {
    listRepositoriesOutputSchema,
    listRepositoriesSchema,
} from "../../schemas/repositories.schema.js";
import { toolFailure, toolSuccess, toolValidationFailure } from "./result.js";

export function registerListRepositories(server: McpServer, githubClient: GithubClient) {
    server.registerTool(
        "list_repositories",
        {
            description: "Lista los repositorios de la cuenta autenticada según su visibilidad y orden solicitado.",
            inputSchema: listRepositoriesSchema.shape,
            outputSchema: listRepositoriesOutputSchema,
        },
        async (args) => {
            const parsed = listRepositoriesSchema.safeParse(args);

            if (!parsed.success) {
                return toolValidationFailure(
                    parsed.error.issues.map((issue) => issue.message).join("; "),
                    parsed.error.issues,
                );
            }

            try {
                const { type, sort, per_page } = parsed.data;
                const data = await listRepos(githubClient, type, sort, per_page);
                return toolSuccess(data);
            } catch (error) {
                return toolFailure(error);
            }
        },
    );
}
