import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { GitHubError } from "../clients/errors.js";
import type { GithubClient } from "../clients/github.client.js";

export async function createRepositoryHandler(
    // exactOptionalPropertyTypes exige el "| undefined" porque zod lo produce
    input: { name: string; description?: string | undefined; private: boolean },
    client: GithubClient,
): Promise<CallToolResult> {
    try {
        // 1. ¿Qué método del client llamas y en qué orden van los argumentos?
        // 2. ¿Qué datos del resultado le sirven al LLM? (¿fullName? ¿url?)
        return { content: [{ type: "text", text: /* ... */ }] };
    } catch (error) {
        // 3. ¿Qué haces si es un GitHubError? ¿Y si es otra cosa?
        return { isError: true, content: [{ type: "text", text: /* ... */ }] };
    }
}
