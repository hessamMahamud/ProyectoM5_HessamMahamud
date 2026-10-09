import * as z from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createRepositoryOutputSchema, createRepositorySchema } from "../../schemas/repositories.schema.js";
import { GithubClient } from "../../clients/github.client.js";
import { toToolError } from "./result.js";

export function registerCreateRepository(server: McpServer) {
    server.registerTool(
        "create_repository",
        {
            description: `Crea un repositorio nuevo en la cuenta autenticada. Usala solo si el repositorio no existe todavía.
            Si el nombre ya está ocupado, elige otro nombre o usa get_repository apra consultarlo.
            El campo name solo permite eltras, números y guiones (1-100 caracteres).
            Ejemplo: {"name", "feature-user-profile", "description": "Feature de perfil de usuario", "private": true}`,
            inputSchema,
        },

        async ({ name, description, private: isPrivate }) => {
            // aquí va la llamada a octokit?
            return {
                content: [{ type: "text", text: `Repositorio ${name} creado` }],
            };
        },
    );
}
