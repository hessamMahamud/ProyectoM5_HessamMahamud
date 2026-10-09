import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createRepositorySchema } from "../../schemas/create_repository.schema.js";
import { GithubClient } from "../../clients/github.client.js";
import { toToolError } from "./result.js";

export function registerCreateRepository(server: McpServer) {
    server.registerTool(
        "create_repository",
        {
            description: `Crea un repositorio nuevo en la cuenta autenticada. Usala solo si el repositorio no existe todavía.
            Si el nombre ya está ocupado, elige otro nombre o usa get_repository para consultarlo.
            El campo name solo permite letras, números y guiones (3-100 caracteres).
            Ejemplo: {"name", "feature-user-profile", "description": "Feature de perfil de usuario", "private": true}`,
            inputSchema: createRepositorySchema.shape,
        },

        async (args) => {
            const parsed = createRepositorySchema.safeParse(args);

            if (!parsed.success) {
                const messages = parsed.error.issues.map((e) => e.message).join("; ");

                const body = {
                    ok: false,
                    error: { type: "VALIDATION", message: messages },
                };

                return {
                    content: [{ type: "text", text: JSON.stringify(body) }],
                    isError: true,
                };
            }

            const { name, description, private: isPrivate } = parsed.data;

            try {
                const gh = new GithubClient();
                const data = await gh.createRepository(name, description, isPrivate);
                const body = { ok: true, data };

                return {
                    structuredContent: body,
                    content: [{ type: "text", text: JSON.stringify(body) }],
                };

            } catch (error) {
                const body = toToolError(error);

                return {
                    content: [{ type: "text", text: JSON.stringify(body) }],
                    isError: true,
                };
            }
        }
    );
}
