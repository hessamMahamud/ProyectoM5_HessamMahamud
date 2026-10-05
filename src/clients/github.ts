import { Octokit } from "@octokit/rest";
import { env } from "../config/env.js";
import { create } from "node:domain";

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

    async function verifyAuth() {
        const { data } = await this.octokit.rest.user.getAuthenticated();
        return {
            login: data.login,
            name: data.name,
            plan: data.plan?.name ?? "unknown",
        };
    };
}
