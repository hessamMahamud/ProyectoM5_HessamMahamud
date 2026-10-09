import * as z from "zod";

export const RepositorySchema = z.object({
    full_name: z.string(),
    url: z.string().url(),
    private: z.boolean(),
    description: z.string().nullable(),
    owner: z.string(),
});

export type Repository = z.infer<typeof RepositorySchema>;
