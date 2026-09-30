import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z as zod } from "zod";

export function registerPing(server: McpServer) {
    server.registerTool(
        "ping",
        {
            description: "Una tool para devolver stirng que diga ping",
            inputSchema: {message: zod.string().optional()},
        },
        async ({ message }) => ({
            content: [{type: "text", text: message ? `pong: ${message}` : "pong"}],
        }),
    );
}
