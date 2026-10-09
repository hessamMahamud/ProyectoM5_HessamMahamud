export type ToolResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: { type: string; message: string; details?: unknown } };

export function toolSuccess<T>(data: T) {
    const body = { ok: true as const, data };

    return {
        structuredContent: body,
        content: [{ type: "text" as const, text: JSON.stringify(body) }],
    };
}

export function toolFailure(error: unknown) {
    const body = toToolError(error);

    return {
        content: [{ type: "text" as const, text: JSON.stringify(body) }],
        isError: true as const,
    };
}

export function toolValidationFailure(message: string, details?: unknown) {
    const body: ToolResult<never> = {
        ok: false as const,
        error: { type: "VALIDATION", message, ...(details !== undefined && { details }) },
    };

    return {
        content: [{ type: "text" as const, text: JSON.stringify(body) }],
        isError: true as const,
    };
}

import { GitHubError, GitHubValidationError } from "../../clients/gh.errors.client.js";
import { ZodError } from "zod";

export function toToolError(error: unknown): ToolResult<never> {
    if (error instanceof ZodError) {
        return {
            ok: false,
            error: {
                type: "VALIDATION",
                message: "El input de la tool no cumple el schema.",
                details: error.issues,
            },
        };
    };

    if (error instanceof GitHubValidationError) {
        return {
            ok: false,
            error: {
                type: "VALIDATION",
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
