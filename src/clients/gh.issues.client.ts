import type { GithubClient } from "./github.client.js";
import { githubRequest } from "./gh.request.client.js";
import type { Issue } from "../schemas/issues.schema.js";

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
    client: GithubClient,
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
    client: GithubClient,
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
