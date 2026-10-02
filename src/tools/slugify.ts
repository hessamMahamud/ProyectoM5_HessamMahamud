import { z as zod } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";

export function registerSlugify(server: McpServer) {
    server.registerTool(
        "slugify",
        {
            description: "Converts a text string into URL-friendly slug",
            inputSchema: { text: zod.string() },
        },
        async ({ text }) => {
            const slug = text
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_]+/g, "")
                .replace(/^-+|-+$/g, "");
            return { content: [{ type: "text", text: slug }] };
        },
    );
}
