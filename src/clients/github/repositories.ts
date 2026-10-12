import type { Octokit } from "@octokit/rest";
import { Issue } from "../../schemas/issues.schema.js";
import { githubRequest } from "./request.js";
import { Repository } from "../../schemas/repositories.schema.js";

function mapIssue(issue: {
    number: number;
    title: string;
    body?: string | null;
    state: string;
    html_url: string;
    user?: { login?: string } | null;
}): Issue {
    return {
        number: issue.number,
        title: issue.title,
        body: issue.body ?? null,
        state: issue.state as "open" | "closed",
        url: issue.html_url,
        user: issue.user?.login ?? "unknown",
    };
}

export async function createIssue(
    client: Octokit,
    owner: string,
    repo: string,
    title: string,
    body?: string,
    labels?: string[],
    assignees?: string[],
): Promise<Issue> {
    const data = await githubRequest(() => client.issues.create({
        owner,
        repo,
        title,
        ...(body !== undefined && { body }),
        ...(labels !== undefined && { labels }),
        ...(assignees !== undefined && { assignees }),
    }));

    return mapIssue(data);
}

export async function listIssues(
    client: Octokit,
    owner: string,
    repo: string,
    state: "open" | "closed" | "all" = "open",
    sort: "created" | "updated" | "comments" = "created",
    direction: "asc" | "desc" = "desc",
    perPage = 30,
    page = 1,
): Promise<Issue[]> {
    const data = await githubRequest(() => client.issues.listForRepo({
        owner,
        repo,
        state,
        sort,
        direction,
        per_page: perPage,
        page,
    }));

    return data.filter((issue) => !issue.pull_request).map(mapIssue);
}

export async function createRepository(
    client: Octokit,
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
    client: Octokit,
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
