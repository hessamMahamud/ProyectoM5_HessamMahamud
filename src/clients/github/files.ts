import type { Octokit } from "@octokit/rest";
import { githubRequest } from "./request.js";
import type { File } from "../../schemas/file.schema.js";
import { Client } from "@modelcontextprotocol/sdk/client";

export async function readFile(
    client: Octokit,
    owner: string,
    repo: string,
    path: string,
    ref?:string,
): Promise<File> {
    const data = await githubRequest(() => client.repos.createOrUpdateFileContents({
        
    }))
}
