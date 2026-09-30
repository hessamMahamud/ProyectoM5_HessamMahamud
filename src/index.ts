import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerPing } from "./tools/ping.js";

const server = new McpServer({
    name: "HX-HMB-agent",
    version: "0.1.0",
});

async function main() {
    registerPing(server)

    await server.connect(new StdioServerTransport());
    console.error("[mcp] server running");
}

main().catch((err) => {
    console.error("[fatal]", err);
    process.exit(1);
});
