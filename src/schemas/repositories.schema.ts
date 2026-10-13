import * as z from "zod";

export const RepositorySchema = z.object({
    full_name: z.string(),
    url: z.string().url(),
    private: z.boolean(),
    description: z.string().nullable(),
    owner: z.string(),
});

export type Repository = z.infer<typeof RepositorySchema>;

export const createRepositorySchema = z.object({
    name: z
        .string()
        .min(3)
        .max(100)
        .regex(/^[a-zA-Z0-9-]+$/, {
            message: "El nombre solo puede contener letras, números y guiones, sin espacios.",
        })
        .describe("Nombre del repositorio (3-100 caracteres, solo letras, números y guiones)"),
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

export const listRepositoriesSchema = z.object({
    type: z
        .enum(["all", "public", "private"])
        .default("all")
        .describe("Tipo de repositorios a listar (default: all)"),
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
        .describe("Cantidad de resultados por página (máximo: 100)"),
});

export const listRepositoriesOutputSchema = z.object({
    ok: z.literal(true),
    data: z.array(RepositorySchema),
});

export const getRepositorySchema = z.object({
    owner: z
        .string()
        .min(1, "El owner no puede estar vacío")
        .max(39, "El owner no puede superar los 39 caracteres.")
        .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9]))*$/, {
            message: "El owner solo admite letras, números y guiones simples, sin empezar ni terminar en guion.",
        }),
    repo: z
        .string()
        .min(1, "El nombre del repositorio no puede estar vacío.")
        .max(100, "El nombre del repositorio no puede superar los 100 caracteres.")
        .regex(/^[a-zA-Z0-9._-]+$/, {
            message: "El repositorio solo admite letras, números, guiones, guiones bajos y puntos.",
        })
        .describe("Nombre del repositorio (ej: hello-world)"),
})

export const getRepositoryOutputSchema = z.object({
    ok: z.literal(true),
    data: RepositorySchema,
})
