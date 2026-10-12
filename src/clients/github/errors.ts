export class GitHubError extends Error {
    constructor(
        message: string,
        public status?: number,
    ) {
        super(message);
        this.name = "GitHubError";
    };
}

export class GitHubAuthError extends GitHubError {
    constructor() {
        super(
            "Token ausente, inválido o expirado (401). Revisa GITHUB_TOKEN en .env,",
            401,
        );
        this.name = "GitHubAuthError";
    };
}

export class GitHubForbiddenError extends GitHubError {
    constructor() {
        super(
            "Permisos insuficientes (403). El token no tiene los scopes necesarios.",
            403,
        );
        this.name = "GitHubForbiddenError"
    };
}

export class GitHubRateLimitError extends GitHubError {
    constructor(public resetEpochSeconds: number) {
        super(
            "Rate limit excedido. Hay que esperar hasta el reset para reintentar.",
            403,
        );
        this.name = "GitHubRateLimitError"
    };
}

export class GitHubNotFoundError extends GitHubError {
    constructor() {
        super(
            "Recurso no encontrado (404). Verifica el owner, repo o que el token tenga acceso.",
            404,
        );
        this.name = "GitHubNotFoundError"
    };
}

export class GitHubValidationError extends GitHubError {
    constructor(message: string, public details?: unknown) {
        super(
            message,
            422,
        );
        this.name = "GitHubValidationError"
    };
}

export class GitHubServerError extends GitHubError {
    constructor(status: number) {
        super(
            `Error interno de GitHub (${status}). Se puede resolver reintentando`,
            status,
        );
        this.name = "GitHubServerError"
    };
}

export class GitHubFileExpectedError extends GitHubError {
    constructor(path: string) {
        super(`La ruta "${path}" no corresponde a un archivo.`, 422);
        this.name = "GitHubFileExpectedError";
    };
};

export function readRateLimit(headers: Record<string, unknown>) {
    return {
        limit: Number(headers["x-ratelimit-limit"] ?? 0),
        remaining: Number(headers["x-ratelimit-remaining"] ?? -1),
        resetEpochSeconds: Number(headers["x-ratelimit-reset"] ?? 0),
    };
}

export function mapGitHubError(error: unknown): GitHubError {
    const candidate = error as {
        status?: number;
        message?: string;
        response?: { headers?: Record<string, unknown>; data?: { errors?: unknown } };
        errors?: unknown;
    } | null;
    const status: number | undefined = candidate?.status;
    const rl = readRateLimit(candidate?.response?.headers ?? {});

    if (status === 401) return new GitHubAuthError();

    if (status === 403 || status === 429) {
        if (rl.remaining === 0 || status === 429) {
            return new GitHubRateLimitError(rl.resetEpochSeconds);
        };

        return new GitHubForbiddenError();
    };

    if (status === 404) return new GitHubNotFoundError();

    if (status === 422) {
        return new GitHubValidationError(
            "Input inválido (422). Probablemente falte un campo requerido como el título.",
            candidate?.response?.data?.errors ?? candidate?.errors,
        );
    };

    if (status && status >= 500) return new GitHubServerError(status);

    return new GitHubError(candidate?.message ?? "Error desconocido", status);
}

export type GitHubErrorCode =
    | "UNAUTHORIZED"
    | "RATE_LIMITED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "VALIDATION"
    | "SERVER_ERROR"
    | "UNKNOWN";
