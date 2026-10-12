import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { GithubClient } from "../../clients/github.client.js";
import { createCommitSchema, createCommitOutputSchema } from "../../schemas/commits.js";
import { toToolError } from "./result.js";

export function registerCreateCommit(server: McpServer) {
    server.registerTool(
        "create_commit",
        {
            description:
            "Creates or replaces a file in a GitHub repositoru by committing it to the specified branch. Handles the full Git object pipeline internally.",
            inputSchema: createCommitSchema.shape,
            outputSchema: createCommitOutputSchema.shape,
        },

        async (args) => {
            const parsed = createCommitSchema.safeParse(args);

            if (!parsed.success) {
                const messages = parsed.error.issues.map((e) => e.message).join("; ");
                const body = {
                    ok: false,
                    error: { type: "VALIDATION", message: messages },
                };

                return {
                    content: [{ type: "text", text: JSON.stringify(body) }],
                    isError: true,
                }
            }

            const { owner, repo, path, content, message, branch } = parsed.data;
            const gh = new GithubClient();

            try {
                const data = await gh.createCommit(
                    owner,
                    repo,
                    path,
                    content,
                    message,
                    branch,
                );

                const result = { ok: true, data };

                return {
                    structuredContent: result,
                    content: [{ type: "text", text: JSON.stringify(result) }],
                };

            } catch (error) {
                const toolError = toToolError(error);

                return {
                    content: [{ type: "text", text: JSON.stringify(toolError) }],
                    isError: true,
                };
            };
        },
    );
};
