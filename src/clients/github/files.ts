import type { Octokit } from "@octokit/rest";
import { githubRequest } from "./request.js";
import { GitHubFileExpectedError } from "./errors.js";
import type { ReadFile } from "../../schemas/file.schema.js";

export async function readFile(
    client: Octokit,
    owner: string,
    repo: string,
    path: string,
    ref?: string,
): Promise<ReadFile> {
    const data = await githubRequest(() => client.repos.getContent({
        owner,
        repo,
        path,
        ...(ref !== undefined && { ref }),
    }));

    if (Array.isArray(data) || data.type !== "file" || typeof data.content !== "string") {
        throw new GitHubFileExpectedError(path);
    }

    return {
        path: data.path,
        content: Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8"),
        sha: data.sha,
        encoding: "utf-8",
        url: data.html_url ?? data.download_url ?? "",
        ...(ref !== undefined && { ref }),
    };
}
