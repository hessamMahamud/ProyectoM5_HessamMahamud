import * as z from "zod";

export const IssueSchema = z.object({
    number: z.number().int().positive(),
    title: z.string(),
    body: z.string().nullable(),
    state: z.enum(["open", "closed"]),
    url: z.string().url(),
    user: z.string(),
});

export type Issue = z.infer<typeof IssueSchema>;

export const createIssueSchema = z.object({
    owner: z.string().trim().min(1).describe("Usuario u organización propietaria"),
    repo: z.string().trim().min(1).describe("Nombre del repositorio"),
    title: z.string().trim().min(1).max(256).describe("Título de la issue"),
    body: z.string().max(65536).optional().describe("Descripción opcional"),
    labels: z.array(z.string().trim().min(1)).max(100).optional(),
    assignees: z.array(z.string().trim().min(1)).max(10).optional(),
});

export const createIssueOutputSchema = z.object({
    ok: z.literal(true),
    data: IssueSchema,
});

export const listIssuesSchema = z.object({
    owner: z.string().trim().min(1),
    repo: z.string().trim().min(1),
    state: z.enum(["open", "closed", "all"]).default("open"),
    sort: z.enum(["created", "updated", "comments"]).default("created"),
    direction: z.enum(["asc", "desc"]).default("desc"),
    per_page: z.number().int().min(1).max(100).default(30),
    page: z.number().int().positive().default(1),
});

export const listIssuesOutputSchema = z.object({
    ok: z.literal(true),
    data: z.array(IssueSchema),
});
