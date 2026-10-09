import * as z from "zod";
import { RepositorySchema } from "./repository.schema.js";

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
