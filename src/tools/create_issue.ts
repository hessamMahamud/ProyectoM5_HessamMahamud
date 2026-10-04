import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";

dotenv.config();

const token = process.env.GITHUB_TOKEN;

if (!token) {
    console.error("Error: GITHUB_TOKEN no está configurado en .env");
    process.exit(1);
}

const octokit = new Octokit({ auth: token });

export async function createIssue(owner: string, repo: string, title: string, body: string) {
    try {
        const { data } = await octokit.rest.issues.create({
            owner,
            repo,
            title,
            body
        });

        console.log(`\nIssue creado: ${data.html_url}`);
    } catch (error: any) {
        if (error.status === 403) {
            console.error("Error: no tienes permisos para crear issues en este repositorio")
        } else if (error.status === 422) {
            console.error(`Error de validación: verificar que el título no esté vacío y que el repo tenga issues habilitados.`);
        } else {
            console.error(`Error (${error.status}): ${error.message}`);
        };
    };
};
