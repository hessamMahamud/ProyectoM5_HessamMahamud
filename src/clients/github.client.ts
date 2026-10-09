import { Octokit } from "@octokit/rest";
import { env } from "../config/env.js";

export type GithubClient = Octokit;

export function createGithubClient(): GithubClient {
    return new Octokit({
        auth: env.GITHUB_TOKEN,
        userAgent: "AutomateHub-Agent",
    });
}
