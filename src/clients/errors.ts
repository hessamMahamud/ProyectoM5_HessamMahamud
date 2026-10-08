import { RequestError } from "@octokit/request-error";

export class GitHubError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly code: GitHubErrorCode,
        public readonly retryable: boolean,
    ) {
        super(message);
        this.name = "GitHubError";
    } /**
  {
  name
  message
  status
  code
  retryable
  }
  */
}

export type GitHubErrorCode =
    | "UNAUTHORIZED"
    | "RATE_LIMITED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "VALIDATION"
    | "SERVER_ERROR"
    | "UNKNOWN";

export function toGitHubError(error: unknown): GitHubError {
    if (error instanceof RequestError) {
        const status = error.status;

        if (status === 401) {
            return new GitHubError(
                "Token inválido o expirado (401). Verificá GITHUB_TOKEN en tu .env y que el token siga activo en GitHub.",
                status,
                "UNAUTHORIZED",
                false,
            );
        }

        if (status === 403 || status === 429) {
            const remaining = error.response?.headers?.["x-ratelimit-remaining"];
            if (remaining === "0" || status === 429) {
                const reset = error.response?.headers?.["x-ratelimit-reset"];
                const resetAt = reset
                    ? new Date(Number(reset) * 1000).toLocaleTimeString()
                    : "desconocido";
                return new GitHubError(
                    `Rate limit excedido (${status}). La cuota se renueva a las ${resetAt}. Reducí la frecuencia de requests o usá paginación más agresiva.`,
                    status,
                    "RATE_LIMITED",
                    true,
                );
            }
            return new GitHubError(
                "Acceso prohibido (403). El token no tiene permisos suficientes para esta operación (revisá los scopes).",
                status,
                "FORBIDDEN",
                false,
            );
        }

        if (status === 404) {
            return new GitHubError(
                "Recurso no encontrado (404). Verificá owner/repo, o que el token tenga acceso a ese repositorio privado.",
                status,
                "NOT_FOUND",
                false,
            );
        }

        if (status === 422) {
            return new GitHubError(
                `Datos inválidos (422): ${error.message}`,
                status,
                "VALIDATION",
                false,
            );
        }

        if (status >= 500) {
            return new GitHubError(
                `Error transitorio del servidor de GitHub (${status}). Suele resolverse reintentando.`,
                status,
                "SERVER_ERROR",
                true,
            );
        }

        return new GitHubError(error.message, status, "UNKNOWN", false);
    }

    const message = error instanceof Error ? error.message : String(error);
    return new GitHubError(message, 0, "UNKNOWN", false);
}
