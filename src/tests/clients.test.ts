import { describe, expect, test, vi } from "vitest";
import type { Octokit } from "@octokit/rest";
import { createIssue, listIssues } from "../clients/github/issues.js";
import { createCommit } from "../clients/github/commits.js";
import { listRepos } from "../clients/github/repositories.js";
import { githubResponse } from "./helpers.js";

describe("cliente de issues", () => {
    test("transforma la respuesta de createIssue", async () => {
        const create = vi.fn().mockResolvedValue(githubResponse({
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
        const listForRepo = vi.fn().mockResolvedValue(githubResponse([
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
});

describe("cliente de commits", () => {
    test("codifica el contenido al crear un commit", async () => {
        const createOrUpdateFileContents = vi.fn().mockResolvedValue(githubResponse({
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

describe("cliente de repositorios", () => {
    test("transforma la respuesta de listRepos y envía sus filtros", async () => {
        const listForAuthenticatedUser = vi.fn().mockResolvedValue(githubResponse([
            {
                full_name: "hessam/automatehub",
                html_url: "https://github.com/hessam/automatehub",
                private: false,
                description: "MCP server",
                owner: { login: "hessam" },
            },
        ]));
        const octokit = { repos: { listForAuthenticatedUser } } as unknown as Octokit;

        await expect(listRepos(octokit, "public", "full_name", 10)).resolves.toEqual([
            {
                full_name: "hessam/automatehub",
                url: "https://github.com/hessam/automatehub",
                private: false,
                description: "MCP server",
                owner: "hessam",
            },
        ]);
        expect(listForAuthenticatedUser).toHaveBeenCalledWith({
            type: "public",
            sort: "full_name",
            per_page: 10,
        });
    });
});
