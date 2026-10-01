import { Octokit } from "@octokit/rest"
import * as dotenv from "dotenv"

dotenv.config();

const token = process.env.GITHUB_TOKEN;

if (!token) {
    console.error("Error: GITHUB_TOKEN no está configurado en .env");
    process.exit(1);
}

const octokit = new Octokit({ auth: token });

async function main() {
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`Conectado como: ${user.login}`);
    console.log(`Nombre: ${user.name}`);
    console.log(`Repos públicos: ${user.public_repos}`);
}

main();
