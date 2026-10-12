import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCreateRepository } from "./github/create_repository.js";
import { registerCreateCommit } from "./github/create_commit.js";
import { registerPing } from "./ping.js";

export function registerAllTools(server: McpServer) {
    registerCreateRepository(server);
    registerPing(server);
    registerCreateCommit(server)
}
