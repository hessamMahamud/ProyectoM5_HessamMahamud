import { z as zod } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerSum(server: McpServer) {
    server.registerTool(
        "sum",
        {
            description: "Returns the sum of two numbers",
            inputSchema: { a: zod.number(), b: zod.number() },
        },
        async ({ a, b }) => ({
            content: [{ type: "text", text: String(a + b) }],
        }),
    );
}
