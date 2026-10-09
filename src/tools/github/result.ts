export type ToolResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: { type: string; message: string; details?: unknown } };

import { inflateSync } from "node:zlib";
import { GitHubError, GitHubValidationError } from "../../clients/errors.js";
import { ZodError } from "zod";

export function toToolError(error: unknown): ToolResult<never> {
    if (error instanceof ZodError) {
        return {
            ok: false,
            error: {
                type: "invalid_input",
                message: "El input de la tool no cumple el schema",
                details: error.issues,
            },
        };
    };

    if (error instanceof GitHubValidationError) {
        return {
            ok: false,
            error: {
                type: "validation_error",
                message: error.message,
                details: error.details,
            },
        };
    };

    if (error instanceof GitHubError) {
        return {
            ok: false,
            error: { type: error.name, message: error.message },
        };
    };

    return {
        ok: false,
        error: {
            type: "unknown_error",
            message: error instanceof Error ? error.message : String(error),
        },
    };
}
