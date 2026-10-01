import { z as zod } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerSum(server: McpServer) {
    server.registerTool(
        "sum",
        {
            description: "Una tool para sumar (a + b)",
            inputSchema: {}
        },
        async ({}) => ({
            content: [],
        }),
    );
}
