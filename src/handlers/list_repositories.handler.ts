import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { GitHubError } from "../clients/gh.errors.client.js";
import type { GithubClient } from "../clients/github.client.js";
import { listRepos } from "../clients/gh.repositories.client.js";

export async function listRepositoriesHandler(
    // exactOptionalPropertyTypes exige el "| undefined" porque zod lo produce
    input: {
        type: "all" | "public" | "private";
        sort: "created" | "updated" | "pushed" | "full_name";
        per_page: number;
    },
    client: GithubClient,
): Promise<CallToolResult> {
    try {
        // 1. Llama a la operación de repositorios con el cliente y los filtros en el orden esperado.
        const repositories = await listRepos(client, input.type, input.sort, input.per_page);

        // 2. Devuelve al LLM los datos ya normalizados por el cliente.
        const result = { ok: true, data: repositories };
        return {
            structuredContent: result,
            content: [{ type: "text", text: JSON.stringify(result) }],
        };
    } catch (error) {
        // 3. Conserva el mensaje conocido de GitHub y protege el handler ante errores inesperados.
        const message = error instanceof GitHubError
            ? error.message
            : error instanceof Error
                ? error.message
                : String(error);

        const result = {
            ok: false,
            error: {
                type: error instanceof GitHubError ? error.name : "unknown_error",
                message,
            },
        };

        return {
            isError: true,
            content: [{ type: "text", text: JSON.stringify(result) }],
        };
    }
}
