import type { GithubClient } from "./github.client.js";

export async function verifyAuth(client: GithubClient) {
    const { data } = await client.rest.users.getAuthenticated();

    return {
        login: data.login,
        name: data.name,
        plan: data.plan?.name ?? "unknown",
    };
}
