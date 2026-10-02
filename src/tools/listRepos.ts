import { octokit } from "../clients/client.js";

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
