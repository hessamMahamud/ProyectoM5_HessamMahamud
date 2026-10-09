import { describe, expect, test } from "vitest";
import {
    GitHubAuthError,
    GitHubNotFoundError,
    GitHubValidationError,
    mapGitHubError,
} from "../clients/gh.errors.client.js";
import { toToolError } from "../tools/github/result.js";

describe("errores de GitHub", () => {
    test("transforma 401 en error de autenticación", () => {
        expect(mapGitHubError({ status: 401 })).toBeInstanceOf(GitHubAuthError);
    });

    test("transforma 404 en error de recurso inexistente", () => {
        expect(mapGitHubError({ status: 404 })).toBeInstanceOf(GitHubNotFoundError);
    });

    test("transforma 422 en error de validación con detalles", () => {
        const error = mapGitHubError({ status: 422, response: { data: { errors: [{ field: "title" }] } } });
        expect(error).toBeInstanceOf(GitHubValidationError);
        expect((error as GitHubValidationError).details).toEqual([{ field: "title" }]);
    });
});

describe("errores de tools", () => {
    test("convierte errores en un resultado legible para una tool", () => {
        expect(toToolError(new GitHubNotFoundError())).toEqual({
            ok: false,
            error: {
                type: "GitHubNotFoundError",
                message: "Recurso no encontrado (404). Verifica el owner, repo o que el token tenga acceso.",
            },
        });
    });
});
