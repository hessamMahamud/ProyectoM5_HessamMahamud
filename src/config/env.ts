import "dotenv/config";
import process from "node:process";

function required(name: string): string {
    const v = process.env[name]
    if (!v) throw new Error(`Missing env var: ${name}`)
    return v
}

export const env = {
    GITHUB_TOKEN: required(`GITHUB_TOKEN`),
    DEFAULT_OWNER: process.env.DEFAULT_OWNER ?? "hessamMahamud",
    DEFAULT_REPO: process.env.DEFAULT_REPO ?? "ProyectoM5_HessamMahamud",
}
