---
title: "Spec tool read_file"
---

# Especificación: tool `read_file`

## Objetivo

Agregar una tool MCP de solo lectura que obtenga un archivo de GitHub, devuelva su contenido UTF-8 y exponga el `sha` del blob. El `sha` se usará después como control de concurrencia al actualizar un archivo mediante `create_commit`.

Esta tool complementa el flujo documentado en [`spec-fixtools.md`](./spec-fixtools.md) y permite trabajar con archivos como `wiseArchive/README.md` sin usar `github-mcp`.

## Contrato MCP

Nombre: `read_file`

La descripción debe aclarar que la operación solo lee, que no crea commits y que devuelve el `sha` necesario para una actualización posterior.

### Entrada

```ts
{
  owner: string;
  repo: string;
  path: string;
  ref?: string;
}
```

Reglas:

- `owner`, `repo` y `path` son obligatorios y no pueden estar vacíos.
- `path` debe ser relativa y no puede comenzar con `/`.
- `ref` es opcional y puede ser una rama, tag o commit.
- Los valores deben recortarse antes de validarse.

### Salida exitosa

```ts
{
  ok: true;
  data: {
    path: string;
    content: string;
    sha: string;
    encoding: "utf-8";
    url: string;
    ref?: string;
  }
}
```

## Implementación propuesta

### `src/schemas/file.schema.ts` — nuevo

Crear schemas Zod para la entrada y salida de `read_file`. El schema de salida debe exigir un `sha` no vacío y una URL válida o vacía, siguiendo el patrón de los schemas existentes.

### `src/clients/github/files.ts` — nuevo

Agregar `readFile(client, owner, repo, path, ref?)` usando:

```ts
client.repos.getContent({
  owner,
  repo,
  path,
  ...(ref !== undefined && { ref }),
})
```

El cliente debe:

- pasar los errores HTTP por `githubRequest`;
- rechazar respuestas en forma de array;
- rechazar respuestas cuyo `type` no sea `file`;
- decodificar `content` desde Base64 a UTF-8;
- conservar el `sha` del archivo;
- devolver `path`, `html_url` o `download_url` cuando estén disponibles;
- no devolver tokens, headers ni contenido de errores internos.

### `src/tools/github/read_file.ts` — nuevo

Registrar la tool con el patrón común de validación, éxito y error del servidor.

### `src/tools/index.tools.ts`

Registrar `registerReadFile(server, githubClient)`.

## Relación con `create_commit`

El flujo para un archivo existente será:

```text
read_file -> devuelve content + sha
          -> el usuario/LLM revisa el contenido
create_commit(..., sha) -> actualiza solo si el blob no cambió
```

No se debe resolver silenciosamente el `sha` dentro de `create_commit` en esta primera versión. Si GitHub rechaza el `sha`, se debe volver a leer el archivo y revisar nuevamente el contenido antes de escribir.

## Tests requeridos

Agregar cobertura para:

- archivo válido con contenido Base64;
- decodificación UTF-8;
- retorno del `sha` correcto;
- envío de `ref` cuando se proporciona;
- omisión de `ref` cuando no se proporciona;
- ruta absoluta inválida;
- respuesta de directorio;
- respuesta en formato array;
- archivo inexistente (`404`);
- credenciales inválidas (`401`);
- permisos insuficientes (`403`);
- respuesta MCP exitosa y errores normalizados.

Todos los tests deben utilizar mocks de Octokit y no modificar GitHub.

## Criterios de aceptación

- La tool aparece al descubrir las capacidades del servidor.
- Devuelve el contenido y el `sha` del blob.
- No crea commits ni modifica archivos.
- Rechaza directorios y rutas inválidas.
- Permite actualizar posteriormente el archivo con `create_commit` y el `sha` recibido.
- Está documentada en el README con un ejemplo para `wiseArchive/README.md`.
- `npm run typecheck`, `npm test` y `npm run build` pasan después de su implementación.

## Prompt de ejemplo

> Lee `README.md` de `hessamMahamud/wiseArchive` en la rama `main`, muéstrame su contenido y devuelve el `sha` del archivo. No hagas cambios.

## Fuera de alcance

- Crear o actualizar archivos.
- Crear commits.
- Leer directorios completos.
- Resolver automáticamente conflictos de contenido.
