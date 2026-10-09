import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createRepositoryOutputSchema, createRepositorySchema } from "../../schemas/repositories.schema.js";
import { createRepository } from "../../clients/gh.repositories.client.js";
import { toolFailure, toolSuccess, toolValidationFailure } from "./result.js";
import type { GithubClient } from "../../clients/github.client.js";

export function registerCreateRepository(server: McpServer, githubClient: GithubClient) {
    server.registerTool(
        "create_repository",
        {
            description: `Crea un repositorio nuevo en la cuenta autenticada. Usala solo si el repositorio no existe todavía.
            Si el nombre ya está ocupado, elige otro nombre o usa get_repository para consultarlo.
            El campo name solo permite letras, números y guiones (3-100 caracteres).
            Ejemplo: {"name": "feature-user-profile", "description": "Feature de perfil de usuario", "private": true}`,
            inputSchema: createRepositorySchema.shape,
            outputSchema: createRepositoryOutputSchema,
        },

        async (args) => {
            const parsed = createRepositorySchema.safeParse(args);

            if (!parsed.success) {
                const messages = parsed.error.issues.map((e) => e.message).join("; ");
                return toolValidationFailure(messages, parsed.error.issues);
            }

            const { name, description, private: isPrivate } = parsed.data;

            try {
                const data = await createRepository(githubClient, name, description, isPrivate);
                return toolSuccess(data);
            } catch (error) {
                return toolFailure(error);
            }
        }
    );
}
