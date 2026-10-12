import { describe, expect, test } from "vitest";
import { createRepositorySchema, listRepositoriesSchema } from "../schemas/repositories.schema.js";
import { createIssueSchema, listIssuesSchema } from "../schemas/issues.schema.js";
import { createCommitSchema } from "../schemas/commit.schema.js";
import { readFileSchema } from "../schemas/file.schema.js";

describe("schemas de repositorios", () => {
    test("acepta un repositorio válido", () => {
        expect(createRepositorySchema.safeParse({ name: "automatehub-demo" }).success).toBe(true);
    });

    test("rechaza nombres demasiado cortos", () => {
        expect(createRepositorySchema.safeParse({ name: "ab" }).success).toBe(false);
    });

    test("rechaza nombres con espacios o símbolos no permitidos", () => {
        expect(createRepositorySchema.safeParse({ name: "mi repo!" }).success).toBe(false);
    });

    test("aplica los valores por defecto al listar repositorios", () => {
        expect(listRepositoriesSchema.parse({})).toEqual({
            type: "all",
            sort: "updated",
            per_page: 3,
        });
    });
});

describe("schemas de issues", () => {
    test("rechaza una issue sin título", () => {
        expect(createIssueSchema.safeParse({ owner: "hessam", repo: "demo", title: " " }).success).toBe(false);
    });

    test("rechaza una página de issues mayor que 100 elementos", () => {
        expect(listIssuesSchema.safeParse({ owner: "hessam", repo: "demo", per_page: 101 }).success).toBe(false);
    });
});

describe("schemas de commits", () => {
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

describe("schemas de archivos", () => {
    test("acepta una ruta relativa válida", () => {
        expect(readFileSchema.safeParse({
            owner: "hessam",
            repo: "wiseArchive",
            path: "README.md",
            ref: "main",
        }).success).toBe(true);
    });

    test("rechaza rutas absolutas", () => {
        expect(readFileSchema.safeParse({
            owner: "hessam",
            repo: "wiseArchive",
            path: "/README.md",
        }).success).toBe(false);
    });

    test("rechaza datos obligatorios vacíos", () => {
        expect(readFileSchema.safeParse({
            owner: " ",
            repo: "wiseArchive",
            path: "README.md",
        }).success).toBe(false);
    });
});
