import type { Octokit } from "@octokit/rest";

export async function verifyAuth(client: Octokit) {
    const { data } = await client.rest.users.getAuthenticated();

    return {
        login: data.login,
        name: data.name,
        plan: data.plan?.name ?? "unknown",
    };
}
