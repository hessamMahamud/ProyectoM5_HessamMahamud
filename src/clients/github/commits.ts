import type { Octokit } from "@octokit/rest";
import { githubRequest } from "./request.js";
import type { Commit } from "../../schemas/commit.schema.js";

export async function createCommit(
  client: Octokit,
  owner: string,
  repo: string,
  message: string,
  content: string,
  path: string,
  branch?: string,
  sha?: string,
): Promise<Commit> {
  const data = await githubRequest(() => client.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(content, "utf8").toString("base64"),
    ...(branch !== undefined && { branch }),
    ...(sha !== undefined && { sha }),
  }));

  return {
    sha: data.commit.sha ?? data.content?.sha ?? "",
    message,
    url: data.commit.html_url ?? data.content?.html_url ?? "",
    path,
  };
}
