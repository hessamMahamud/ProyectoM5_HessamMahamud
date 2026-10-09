import { Octokit } from "@octokit/rest";
import { env } from "../config/env.js";
import { githubRequest } from "./request.js";

function createOcotkit() {
    return new Octokit({
        auth: env.GITHUB_TOKEN,
        userAgent: "AutomateHub-Agent"
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

    async createRepository(name: string, description?: string, isPrivate: boolean = false): Promise<Repository> {
        const data = await githubRequest(() => this.octokit.repos.createForAuthenticatedUser({
           name,
           ...(description !== undefined && { description }),
           private: isPrivate,
           auto_init: true,
        }));

        return {
            fullName: data.full_name,
            url: data.html_url,
            private: data.private,
            description: data.description ?? null,
            owner: data.owner.login,
        };
    };

    async listRepos(
        type: "all" | "public" | "private" = "all",
        sort: "created" | "updated" | "pushed" | "full_name" = "updated",
        per_page: number = 3,
    ): Promise<Repository[]> {
        const data = await githubRequest(() => this.octokit.repos.listForAuthenticatedUser({ type, sort, per_page }));

        return data.map((repo) => ({
            fullName: repo.full_name,
            url: repo.html_url,
            private: repo.private,
            description: repo.description ?? null,
            owner: repo.owner.login,
        }));
    };
}
