import {
    readRateLimit,
    mapGitHubError,
    GitHubRateLimitError,
    GitHubServerError,
} from "./errors.js";

export const githubRequest = async<T>(
    operation: () => Promise<{ data: T; headers: Record<string, unknown> }>,
    attempt = 0,
): Promise<T> => {

    try {
        const res = await operation();
        const rl = readRateLimit(res.headers);
        console.error(`[GH RateLimit] remaining: ${rl.remaining}/${rl.limit}`);
        return res.data;

    } catch (error) {
        const err = mapGitHubError(error);

        if (err instanceof GitHubRateLimitError && attempt === 0) {
            await delayUntilReset(err.resetEpochSeconds);
            return githubRequest(operation, attempt + 1);
        }

        if (err instanceof GitHubServerError && attempt < 2) {
            const delay = 1000 * 2 ** attempt;
            console.error(`[GH] Error ${err.status}, reintentando en ${delay / 1000}s...`,);
            await new Promise((r) => setTimeout(r, delay));
            return githubRequest(operation, attempt + 1);
        }

        throw err;
    };
}

export const delayUntilReset = async (resetEpochSeconds: number) => {
    const now = Math.floor(Date.now() / 1000);
    const delay = Math.max(0, resetEpochSeconds - now) * 1000 + 1000;
    console.error(`[GH] Rate limit alcanzado, reintentando en ${delay / 1000}s`);
    await new Promise((r) => setTimeout(r, delay));
}
