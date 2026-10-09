import * as z from "zod";
import { RepositorySchema } from "./repository.schema.js";

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
