/*----< Libraries >----*/
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerPing } from "./tools/ping.js";
import { Octokit } from "@octokit/rest"
import * as dotenv from "dotenv"
/*----< Tools >----*/
import { listRepos } from "./tools/listRepos.js";
import { getRepo } from "./tools/getRepo.js";
import { createIssue } from "./tools/createIssue.js";

const server = new McpServer({
    name: "HX-HMB-agent",
    version: "0.1.0",
});

dotenv.config();

const token = process.env.GITHUB_TOKEN;

if (!token) {
    console.error("Error: GITHUB_TOKEN no está configurado en .env");
    process.exit(1);
}

const octokit = new Octokit({ auth: token });

async function main() {
    registerPing(server);

    await server.connect(new StdioServerTransport());
    console.error("[mcp] server running");
}

main().catch((err) => {
    console.error("[fatal]", err);
    process.exit(1);
});

async function octokitMain() {
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`Conectado como: ${user.login}`);
    console.log(`Nombre: ${user.name}`);
    console.log(`Repos públicos: ${user.public_repos}`);

    await listRepos();
    await getRepo("hessamMahamud", "ProyectoM5_HessamMahamud");
    await createIssue("hessamMahamud", "ProyectoM4_HessamMahamud", "Test desde Octokit", "Este issue fue creado desde mi homework de Octokit.");
}

async function checkRateLimit() {
    const { data } = await octokit.rest.rateLimit.get();
    const core = data.resources.core;
    const resetDate = new Date(core.reset * 1000).toLocaleTimeString();

    console.log(`\nRate limit:`);
    console.log(`   Límite: ${core.limit} request/hora`);
    console.log(`   Restantes: ${core.remaining}`);
    console.log(`   Se resetea a las: ${resetDate}`);
}

octokitMain();
checkRateLimit();
