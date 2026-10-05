import * as z from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const CreateIssueSchema = z.object({
    owner: z.string().min(1, "Owner es requerido"),
    repo: z.string(),
})
