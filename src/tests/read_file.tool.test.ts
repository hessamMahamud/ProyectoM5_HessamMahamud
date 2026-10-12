import { describe, expect, test, vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { registerReadFile } from "../tools/github/read_file.js";
import { githubResponse } from "./helpers.js";

describe("tool read_file", () => {
    test("devuelve contenido y sha en structuredContent", async () => {
        const getContent = vi.fn().mockResolvedValue(githubResponse({
            type: "file",
            path: "README.md",
            content: Buffer.from("contenido", "utf8").toString("base64"),
            sha: "blob-sha",
            html_url: "https://github.com/hessam/wiseArchive/blob/main/README.md",
        }));
        const client = { repos: { getContent } } as unknown as Octokit;
        const registerTool = vi.fn();
        const server = { registerTool } as unknown as McpServer;

        registerReadFile(server, client);

        const handler = registerTool.mock.calls[0]![2] as (args: unknown) => Promise<{
            structuredContent?: unknown;
            isError?: boolean;
        }>;
        const result = await handler({
            owner: "hessam",
            repo: "wiseArchive",
            path: "README.md",
            ref: "main",
        });

        expect(result.isError).toBeUndefined();
        expect(result.structuredContent).toEqual({
            ok: true,
            data: {
                path: "README.md",
                content: "contenido",
                sha: "blob-sha",
                encoding: "utf-8",
                url: "https://github.com/hessam/wiseArchive/blob/main/README.md",
                ref: "main",
            },
        });
    });

    test("devuelve error de validación para una ruta absoluta", async () => {
        const client = { repos: { getContent: vi.fn() } } as unknown as Octokit;
        const registerTool = vi.fn();
        const server = { registerTool } as unknown as McpServer;

        registerReadFile(server, client);

        const handler = registerTool.mock.calls[0]![2] as (args: unknown) => Promise<{
            isError?: boolean;
            content: Array<{ text: string }>;
        }>;
        const result = await handler({
            owner: "hessam",
            repo: "wiseArchive",
            path: "/README.md",
        });

        expect(result.isError).toBe(true);
        expect(result.content[0]?.text).toContain('"type":"VALIDATION"');
        expect(client.repos.getContent).not.toHaveBeenCalled();
    });
});
