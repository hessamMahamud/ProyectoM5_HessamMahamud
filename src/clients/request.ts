import { GitHubError, toGitHubError } from "./errors.js";

export type ApiResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: { message: string; status: number; code: string } };

export interface RetryOptions {
    maxRetries?: number;
    baseDelayMs?: number;
}

const DEFAULTS: Required<RetryOptions> = {
    maxRetries: 3,
    baseDelayMs: 500,
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function githubRequest<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
): Promise<ApiResult<T>> {
    const { maxRetries, baseDelayMs } = { ...DEFAULTS, ...options };

    let lastError: GitHubError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const data = await operation();
            return { ok: true, data };
        } catch (error) {
            lastError = toGitHubError(error);

            const isLastAttempt = attempt === maxRetries;
            if (!lastError.retryable || isLastAttempt) break;

            const delay = baseDelayMs * 2 ** attempt + Math.random() * 250;
            console.warn(
                `Intento ${attempt + 1}/${maxRetries} falló (${lastError.status}). ` +
                `Reintentando en ${Math.round(delay)}ms...`,
            );
            await sleep(delay);
        }
    }

    return {
        ok: false,
        error: {
            message: lastError!.message,
            status: lastError!.status,
            code: lastError!.code,
        },
    };
}
