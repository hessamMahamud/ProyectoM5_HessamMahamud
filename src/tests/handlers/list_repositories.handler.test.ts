import { describe, expect, test, vi } from "vitest";
import type { Octokit } from "@octokit/rest";
import { listRepositoriesHandler } from "../../handlers/list_repositories.handler.js";
import { githubResponse } from "../helpers.js";

describe("listRepositoriesHandler", () => {
    test("devuelve los repositorios en structuredContent", async () => {
        const listForAuthenticatedUser = vi.fn().mockResolvedValue(githubResponse([
            {
                full_name: "hessam/automatehub",
                html_url: "https://github.com/hessam/automatehub",
                private: false,
                description: "MCP server",
                owner: { login: "hessam" },
            },
        ]));
        const client = { repos: { listForAuthenticatedUser } } as unknown as Octokit;

        const result = await listRepositoriesHandler({
            type: "public",
            sort: "full_name",
            per_page: 10,
        }, client);

        expect(result.isError).toBeUndefined();
        expect(result.structuredContent).toEqual({
            ok: true,
            data: [{
                full_name: "hessam/automatehub",
                url: "https://github.com/hessam/automatehub",
                private: false,
                description: "MCP server",
                owner: "hessam",
            }],
        });
    });

    test("devuelve un error MCP cuando GitHub responde 404", async () => {
        const listForAuthenticatedUser = vi.fn().mockRejectedValue({ status: 404 });
        const client = { repos: { listForAuthenticatedUser } } as unknown as Octokit;

        const result = await listRepositoriesHandler({
            type: "all",
            sort: "updated",
            per_page: 3,
        }, client);

        expect(result.isError).toBe(true);
        expect(result.content[0]).toMatchObject({
            type: "text",
            text: expect.stringContaining("GitHubNotFoundError"),
        });
    });
});
