import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GithubClient } from "../../clients/github.client.js";
import { readFile } from "../../clients/github/files.js";
import {
    readFileOutputSchema,
    readFileSchema,
} from "../../schemas/file.schema.js";
import { toolFailure, toolSuccess, toolValidationFailure } from "./result.js";

export function registerReadFile(server: McpServer, githubClient: GithubClient) {
    server.registerTool(
        "read_file",
        {
            description: "Lee un archivo de un repositorio sin modificarlo y devuelve su contenido y el sha del blob para una actualización posterior.",
            inputSchema: readFileSchema.shape,
            outputSchema: readFileOutputSchema,
        },
        async (args) => {
            const parsed = readFileSchema.safeParse(args);

            if (!parsed.success) {
                return toolValidationFailure(
                    parsed.error.issues.map((issue) => issue.message).join("; "),
                    parsed.error.issues,
                );
            }

            try {
                const { owner, repo, path, ref } = parsed.data;
                const data = await readFile(githubClient, owner, repo, path, ref);
                return toolSuccess(data);
            } catch (error) {
                return toolFailure(error);
            }
        },
    );
}
