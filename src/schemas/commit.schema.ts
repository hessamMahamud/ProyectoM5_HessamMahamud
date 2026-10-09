import * as z from "zod";

export const CommitSchema = z.object({
    sha: z.string().min(1),
    message: z.string().min(1),
    url: z.string().url().or(z.literal("")),
    path: z.string().min(1),
});

export type Commit = z.infer<typeof CommitSchema>;

export const createCommitSchema = z.object({
    owner: z.string().trim().min(1),
    repo: z.string().trim().min(1),
    message: z.string().trim().min(1).max(256),
    content: z.string().min(1),
    path: z.string().trim().min(1).refine((value) => !value.startsWith("/"), {
        message: "La ruta debe ser relativa al repositorio.",
    }),
    branch: z.string().trim().min(1).optional(),
    sha: z.string().trim().min(1).optional(),
});

export const createCommitOutputSchema = z.object({
    ok: z.literal(true),
    data: CommitSchema,
});
