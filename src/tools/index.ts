import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { registerCreateRepository } from "./create_repository.js";
import { registerPing } from "./ping.js";
import { registerSum } from "./sum.js";
import { registerSlugify } from "./slugify.js";

export function registerAllTools(server: McpServer) {
    registerCreateRepository(server);
    registerPing(server);
    registerSum(server);
    registerSlugify(server);
}
