import { describe, expect, test, vi } from "vitest";
import type { Octokit } from "@octokit/rest";
import { createRepositorySchema } from "../schemas/repositories.schema.js";
import { createIssueSchema, listIssuesSchema } from "../schemas/issues.schema.js";
import { createCommitSchema } from "../schemas/commit.schema.js";
import { createIssue, listIssues } from "../clients/gh.issues.client.js";
import { createCommit } from "../clients/gh.commits.client.js";
import {
    GitHubAuthError,
    GitHubNotFoundError,
    GitHubValidationError,
    mapGitHubError,
} from "../clients/gh.errors.client.js";
import { toToolError } from "../tools/github/result.js";

const response = <T>(data: T) => ({
    data,
    headers: {
        "x-ratelimit-limit": "5000",
        "x-ratelimit-remaining": "4999",
        "x-ratelimit-reset": "0",
    },
});

describe("schemas", () => {
    test("acepta un repositorio válido", () => {
        expect(createRepositorySchema.safeParse({ name: "automatehub-demo" }).success).toBe(true);
    });

    test("rechaza nombres demasiado cortos", () => {
        expect(createRepositorySchema.safeParse({ name: "ab" }).success).toBe(false);
    });

    test("rechaza nombres con espacios o símbolos no permitidos", () => {
        expect(createRepositorySchema.safeParse({ name: "mi repo!" }).success).toBe(false);
    });

    test("rechaza una issue sin título", () => {
        expect(createIssueSchema.safeParse({ owner: "hessam", repo: "demo", title: " " }).success).toBe(false);
    });

    test("rechaza una página de issues mayor que 100 elementos", () => {
        expect(listIssuesSchema.safeParse({ owner: "hessam", repo: "demo", per_page: 101 }).success).toBe(false);
    });

    test("rechaza rutas absolutas al crear un commit", () => {
        expect(createCommitSchema.safeParse({
            owner: "hessam",
            repo: "demo",
            message: "Add file",
            content: "hello",
            path: "/README.md",
        }).success).toBe(false);
    });
});

describe("clientes funcionales de GitHub", () => {
    test("transforma la respuesta de createIssue", async () => {
        const create = vi.fn().mockResolvedValue(response({
            number: 7,
            title: "Add auth",
            body: "Implement auth",
            state: "open",
            html_url: "https://github.com/hessam/demo/issues/7",
            user: { login: "hessam" },
        }));
        const octokit = { issues: { create } } as unknown as Octokit;
        await expect(createIssue(octokit, "hessam", "demo", "Add auth", "Implement auth"))
            .resolves.toEqual({
                number: 7,
                title: "Add auth",
                body: "Implement auth",
                state: "open",
                url: "https://github.com/hessam/demo/issues/7",
                user: "hessam",
            });
        expect(create).toHaveBeenCalledWith({
            owner: "hessam",
            repo: "demo",
            title: "Add auth",
            body: "Implement auth",
        });
    });

    test("lista issues y excluye pull requests", async () => {
        const listForRepo = vi.fn().mockResolvedValue(response([
            {
                number: 1,
                title: "Issue",
                body: null,
                state: "open",
                html_url: "https://github.com/hessam/demo/issues/1",
                user: { login: "hessam" },
            },
            {
                number: 2,
                title: "Pull request",
                body: null,
                state: "open",
                html_url: "https://github.com/hessam/demo/pull/2",
                user: { login: "hessam" },
                pull_request: { url: "https://api.github.com/pulls/2" },
            },
        ]));
        const octokit = { issues: { listForRepo } } as unknown as Octokit;
        await expect(listIssues(octokit, "hessam", "demo")).resolves.toHaveLength(1);
        expect(listForRepo).toHaveBeenCalledWith({
            owner: "hessam",
            repo: "demo",
            state: "open",
            sort: "created",
            direction: "desc",
            per_page: 30,
            page: 1,
        });
    });

    test("codifica el contenido al crear un commit", async () => {
        const createOrUpdateFileContents = vi.fn().mockResolvedValue(response({
            content: { sha: "file-sha", html_url: "https://github.com/hessam/demo/blob/main/README.md" },
            commit: { sha: "commit-sha", html_url: "https://github.com/hessam/demo/commit/commit-sha" },
        }));
        const octokit = { repos: { createOrUpdateFileContents } } as unknown as Octokit;
        await expect(createCommit(octokit, "hessam", "demo", "Add README", "hola", "README.md", "main"))
            .resolves.toMatchObject({ sha: "commit-sha", path: "README.md" });
        expect(createOrUpdateFileContents).toHaveBeenCalledWith(expect.objectContaining({
            content: Buffer.from("hola").toString("base64"),
            branch: "main",
        }));
    });
});

describe("errores", () => {
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
