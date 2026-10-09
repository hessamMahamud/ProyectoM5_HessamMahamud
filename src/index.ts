import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/index.tools.js";

const server = new McpServer({
    name: "AutomateHub",
    version: "0.1.0",
});

async function main() {
    registerAllTools(server);

    await server.connect(new StdioServerTransport());
    console.error("[mcp] server running");
}

main().catch((err) => {
    console.error("[fatal]", err);
    process.exit(1);
});
