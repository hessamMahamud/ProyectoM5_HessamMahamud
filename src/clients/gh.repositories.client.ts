import type { GithubClient } from "./github.client.js";
import { githubRequest } from "./gh.request.client.js";
import type { Repository } from "../schemas/repositories.schema.js";

export async function createRepository(
    client: GithubClient,
    name: string,
    description?: string,
    isPrivate = false,
): Promise<Repository> {
    const data = await githubRequest(() => client.repos.createForAuthenticatedUser({
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
}

export async function listRepos(
    client: GithubClient,
    type: "all" | "public" | "private" = "all",
    sort: "created" | "updated" | "pushed" | "full_name" = "updated",
    perPage = 3,
): Promise<Repository[]> {
    const data = await githubRequest(() => client.repos.listForAuthenticatedUser({
        type,
        sort,
        per_page: perPage,
    }));

    return data.map((repo) => ({
        full_name: repo.full_name,
        url: repo.html_url,
        private: repo.private,
        description: repo.description ?? null,
        owner: repo.owner.login,
    }));
}
