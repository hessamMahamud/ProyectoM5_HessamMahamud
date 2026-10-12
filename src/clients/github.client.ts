import { Octokit } from "@octokit/rest";
import { env } from "../config/env.js";
import { githubRequest } from "./request.js";
import { Repository } from "../schemas/repositories.js";
import type { CreateCommit } from "../schemas/commits.js";

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

    async createRepository(
        name: string,
        description?: string,
        isPrivate: boolean = false,
    ): Promise<Repository> {
        const data = await githubRequest(() => this.octokit.repos.createForAuthenticatedUser({
            name,
            ...(description !== undefined && { description }),
            private: isPrivate,
            auto_init: true,
        }));

        return {
            full_name: data.full_name,
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
        const data = await githubRequest(() =>
            this.octokit.repos.listForAuthenticatedUser({ type, sort, per_page })
        );

        return data.map((repo) => ({
            full_name: repo.full_name,
            url: repo.html_url,
            private: repo.private,
            description: repo.description ?? null,
            owner: repo.owner.login,
        }));
    };

    async createCommit(
        owner: string,
        repo: string,
        path: string,
        content: string,
        message: string,
        branch: string = "main",
    ): Promise<CreateCommit> {
        const refData = await githubRequest(() =>
            this.octokit.git.getRef({ owner, repo, ref: `heads/${branch}` }),
        );

        const commitSha = refData.object.sha;

        const commitData = await githubRequest(() =>
            this.octokit.git.getCommit({ owner, repo, commit_sha: commitSha }),
        );

        const treeSha = commitData.tree.sha;

        const blobData = await githubRequest(() =>
            this.octokit.git.createBlob({
                owner,
                repo,
                content: Buffer.from(content, "utf-8").toString("base64"),
                encoding: "base64",
            }),
        );

        const treeData = await githubRequest(() =>
            this.octokit.git.createTree({
                owner,
                repo,
                base_tree: treeSha,
                tree: [{ path, mode: "100644", type: "blob", sha: blobData.sha }],
            }),
        );

        const newCommit = await githubRequest(() =>
            this.octokit.git.createCommit({
                owner,
                repo,
                message,
                tree: treeData.sha,
                parents: [commitSha],
            }),
        );

        await githubRequest(() =>
            this.octokit.git.updateRef({
                owner,
                repo,
                ref: `heads/${branch}`,
                sha: newCommit.sha,
            }),
        );

        return {
            sha: newCommit.sha,
            url: `https://github.com/${owner}/${repo}/blob/${branch}/${path}`,
            path,
            branch,
        };
    };
}
