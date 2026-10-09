import * as z from "zod";

export const RepositorySchema = z.object({
    full_name: z.string(),
    url: z.string().url(),
    private: z.boolean(),
    description: z.string().nullable(),
    owner: z.string(),
});

export type Repository = z.infer<typeof RepositorySchema>;

export const listRepositoriesSchema = z.object({
    type: z
        .enum(["all", "public", "private"])
        .default("all")
        .describe("Tipo de repos a listar (default: all"),
    sort: z
        .enum(["created", "updated", "pushed", "full_name"])
        .default("updated")
        .describe("Criterio de ordenamiento (default: updated)"),
    per_page: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(3)
        .describe("Cantidad de resultados por página, más 100 (defaukt: 3)"),
});

export const listRepositoriesOutputSchema = z.object({
    ok: z.literal(true),
    data: z.array(RepositorySchema),
});

export const createRepositorySchema = z.object({
    name: z
        .string()
        .min(3)
        .max(100)
        .regex(/^[a-zA-Z0-9_.-]+$/, {
            message: "El nombre solo puede contener letras, números, guines bajos, puntos y guines medios. Sin espacios.",
        })
        .describe(
            "Nombre del repositorio (sin espacios, solo [a-zA-Z0-9_.-],min 3 máx 100 caracteres)"
        ),
    description: z
        .string()
        .optional()
        .describe("Descripción opcional del repositorio"),
    private: z
        .boolean()
        .default(false)
        .describe("Si el repositorio es privado (default: false)"),
});

export const createRepositoryOutputSchema = z.object({
    ok: z.literal(true),
    data: RepositorySchema,
});
