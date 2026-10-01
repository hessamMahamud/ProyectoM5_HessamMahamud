import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";

dotenv.config();

const token = process.env.GITHUB_TOKEN;

if (!token) {
    console.error("Error: GITHUB_TOKEN no está configurado en .env");
    process.exit(1);
}

const octokit = new Octokit({ auth: token });

export async function listRepos() {
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
        per_page: 10,
        sort: "updated"
    });

    console.log(`\nTus últimos ${repos.length} repositorios`);
    repos.forEach(repo => {
        console.log(`- ${repo.name} (${repo.private ? "privado" : "público"})`);
    });
}
