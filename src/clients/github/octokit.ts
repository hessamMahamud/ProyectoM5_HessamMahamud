import { Octokit } from "@octokit/rest";
import { env } from "../../config/env.js";

export function createOctokit() {
    return new Octokit({
        auth: env.GITHUB_TOKEN,
        userAgent: `ProyectoM5_HessamMahamud/1.0`,
    });
}
