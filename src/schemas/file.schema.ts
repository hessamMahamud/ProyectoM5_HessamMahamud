import * as z from "zod";

export const readFileSchema = z.object({
    owner: z.string().trim().min(1),
    repo: z.string().trim().min(1),
    path: z.string().trim().min(1).refine((value) => !value.startsWith("/"), {
        message: "La ruta debe ser relativa al repositorio.",
    }),
    ref: z.string().trim().min(1).optional(),
});

export const FileSchema = z.object({
    path: z.string().min(1),
    content: z.string(),
    sha: z.string().min(1),
    encoding: z.literal("utf-8"),
    url: z.string().url().or(z.literal("")),
    ref: z.string().min(1).optional(),
});

export const readFileOutputSchema = z.object({
    ok: z.literal(true),
    data: FileSchema,
});

export type ReadFile = z.infer<typeof FileSchema>;
