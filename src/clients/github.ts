import { Octokit } from "@octokit/rest";
import { env } from "../config/env.js";

function createOcotkit() {
    return new Octokit({
        auth: env.GITHUB_TOKEN,
        userAgent: "hessMahBu-agent"
    });
}

export class GithubClient {
    private octokit: Octokit;

    constructor(octokit: Octokit = createOcotkit()) {
        this.octokit = octokit;
    }

    async verifyAuth() {
        const { data } = await this.octokit.rest.users.getAuthenticated();
        return {
            login: data.login,
            name: data.name,
            plan: data.plan?.name ?? "unknown",
        };
    };
}

// faltan funciones
