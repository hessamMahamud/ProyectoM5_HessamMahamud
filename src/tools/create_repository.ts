import * as z from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const inputSchema = z.object({
    name: z.string()
        .min(1, "El nombre no puede estar vacío")
        .max(100, "Máximo 100 caracteres")
        .regex(/^[a-zA-Z0-9\-]+$/, "Sólo se permiten letras números y guiones (.)"),
    description: z.string().max(255).optional(),
    private: z.boolean().optional().default(false),
});

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
