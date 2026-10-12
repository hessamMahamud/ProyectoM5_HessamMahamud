import * as z from "zod";

export const createCommitSchema = z.object({
    owner: z
        .string()
        .describe("Github username or organization owns the repository"),
    repo: z
        .string()
        .describe("Repository name (without the owner prefix)"),
    path: z
        .string()
        .describe("File path relative to the repository root, e.g. 'src/index.ts'"),
    content: z
        .string()
        .describe("Full UTF-8 content to werite into file"),
    message: z
        .string()
        .min(10)
        .max(300)
        .describe("Commit message taht describes this change"),
    branch: z
        .string()
        .default("main")
        .describe("Target branch to commit to. Defaults to 'main"),
});

export const CreatedCommitSchema = z.object({
    sha: z.string(),
    url: z.string(),
    path: z.string(),
    branch: z.string(),
});

export const createCommitOutputSchema = z.object({
    ok: z.literal(true),
    data: CreatedCommitSchema,
});

export type CreateCommit = z.infer<typeof CreatedCommitSchema>;
