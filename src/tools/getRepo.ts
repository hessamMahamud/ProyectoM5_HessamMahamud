import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";

dotenv.config();

const token = process.env.GITHUB_TOKEN;

if (!token) {
    console.error("Error: GITHUB_TOKEN no está configurado en .env");
    process.exit(1);
}

const octokit = new Octokit({ auth: token });

export async function getRepo(owner: string, repo: string) {
    try {
        const { data } = await octokit.rest.repos.get({ owner, repo });
        console.log(`\nRepositorios: ${data.full_name}`);
        console.log(`Descripción: ${data.description}`);
        console.log(`Branch principal: ${data.default_branch}`);
    } catch (error: any) {
        if (error.status === 404) {
            console.error(`Error: el repositorio "${owner}/${repo}" no existe o no tienes acceso.`);
        } else if (error.status === 401) {
            console.error("Error: token inválido o expirado. Verificar GITHUB_TOKEN en .env");
        } else {
            console.error(`Error inesperado (${error.status}): ${error.message}`);
        };
    };
};
