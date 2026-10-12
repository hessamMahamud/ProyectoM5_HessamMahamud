# Especificación: lectura de archivos y resolución de `sha` en AutomateHub MCP

## Objetivo

Permitir que `automateHub-mcp-server` lea un archivo de un repositorio y obtenga su `sha` antes de actualizarlo. Esto habilita el flujo necesario para modificar `README.md` en `wiseArchive` sin depender de `github-mcp`:

1. Leer `wiseArchive/README.md`.
2. Obtener el contenido actual y el `sha` del archivo.
3. Enviar el nuevo contenido a `create_commit` junto con ese `sha`.
4. Crear el commit mediante la API de GitHub.

El `sha` debe corresponder al blob actual del archivo, no al `sha` del commit más reciente. GitHub lo utiliza para comprobar que la actualización no sobrescribe cambios concurrentes.

## Cambio recomendado de API MCP

Agregar una tool de lectura llamada `read_file`.

### Entrada

```ts
{
  owner: string;
  repo: string;
  path: string;     // ruta relativa, por ejemplo: "README.md"
  ref?: string;     // rama, tag o commit; por defecto la rama predeterminada
}
```

### Salida

```ts
{
  ok: true;
  data: {
    path: string;
    content: string;
    sha: string;
    encoding: "utf-8";
    url: string;
    branch?: string;
  }
}
```

La tool debe aceptar únicamente archivos. Si GitHub devuelve un directorio, debe devolver un error de validación indicando que se debe proporcionar la ruta de un archivo.

## Archivos que deberían modificarse

### 1. `src/schemas/file.schema.ts` — nuevo

Crear los esquemas Zod para:

- `readFileSchema`: `owner`, `repo`, `path` y `ref` opcional.
- `FileSchema`: `path`, `content`, `sha`, `encoding`, `url` y `branch` opcional.
- `readFileOutputSchema`: envoltorio `{ ok: true, data: FileSchema }`.

Validaciones recomendadas:

- `owner` y `repo`: strings no vacíos.
- `path`: string no vacío y no debe empezar por `/`.
- `ref`: string no vacío opcional.
- `sha`: string no vacío.

### 2. `src/clients/github/files.ts` — nuevo

Implementar `readFile` usando `client.repos.getContent`:

```ts
client.repos.getContent({ owner, repo, path, ...(ref && { ref }) })
```

El cliente debe:

- comprobar que la respuesta no sea un array;
- comprobar que `type === "file"`;
- decodificar `content` desde Base64 a UTF-8;
- devolver el `sha` del archivo (`data.sha`);
- devolver `path` y `html_url`/`download_url` cuando estén disponibles.

Si la respuesta representa un directorio, debe lanzar un error específico, por ejemplo `GithubFileExpectedError`. Los errores HTTP deben seguir pasando por `githubRequest` para conservar la política actual de reintentos y traducción de errores.

### 3. `src/tools/github/read_file.ts` — nuevo

Registrar la tool MCP `read_file`, siguiendo el patrón de las tools existentes:

- validar los argumentos con `readFileSchema`;
- llamar a `readFile` del cliente;
- responder mediante `toolSuccess`;
- transformar fallos mediante `toolFailure` o `toolValidationFailure`.

La descripción de la tool debe indicar claramente que devuelve el `sha` necesario para actualizar el archivo.

### 4. `src/tools/index.tools.ts`

Importar y registrar `registerReadFile(server, githubClient)` junto con las demás tools.

### 5. `src/clients/github/commits.ts`

Mantener el parámetro `sha` opcional para permitir crear archivos nuevos, pero documentar y controlar estos dos casos:

- archivo nuevo: `sha` omitido;
- archivo existente: `sha` obtenido previamente con `read_file`.

Recomendación: no resolver el `sha` automáticamente dentro de `createCommit` en esta primera versión. El flujo explícito `read_file` → `create_commit` hace visible la comprobación de concurrencia y evita una lectura silenciosa justo antes de escribir.

Opcionalmente, una versión posterior puede añadir `update_file` como operación compuesta que lea el archivo, compruebe el `sha` y actualice el contenido en una sola llamada.

### 6. `src/tests/clients.test.ts`

Agregar pruebas para `readFile`:

- decodifica correctamente contenido Base64;
- devuelve el `sha` del archivo;
- envía `owner`, `repo`, `path` y `ref` correctos;
- rechaza una respuesta de tipo directorio;
- rechaza una respuesta en formato array.

### 7. `src/tests/handlers/read_file.handler.test.ts` — nuevo

Agregar pruebas de la capa MCP para comprobar:

- respuesta exitosa con `structuredContent.data.sha`;
- rechazo de una ruta inválida;
- conversión uniforme de errores de GitHub.

### 8. `src/tests/schemas.test.ts`

Agregar casos para las nuevas validaciones de `readFileSchema`, incluyendo rutas absolutas y valores vacíos.

### 9. `README.md` del servidor AutomateHub

Documentar:

- la nueva tool `read_file`;
- que `sha` es el SHA del archivo/blob;
- el flujo de actualización de un archivo existente;
- un ejemplo de uso con `wiseArchive/README.md`.

## Flujo esperado para `wiseArchive`

```text
read_file(
  owner: "hessamMahamud",
  repo: "wiseArchive",
  path: "README.md",
  ref: "main"
)
        |
        | devuelve content + sha
        v
create_commit(
  owner: "hessamMahamud",
  repo: "wiseArchive",
  path: "README.md",
  branch: "main",
  sha: "<sha-devuelto-por-read_file>",
  content: "<nuevo README>",
  message: "docs: describe wiseArchive"
)
```

Si el `sha` ya no coincide, GitHub debe rechazar la actualización. En ese caso, se debe volver a ejecutar `read_file`, revisar el contenido más reciente y repetir la actualización con el nuevo `sha`.

## Criterios de aceptación

- `automateHub-mcp-server` expone `read_file` al iniciar.
- `read_file` devuelve contenido UTF-8 y el `sha` del archivo.
- `read_file` no trata directorios como archivos.
- `create_commit` puede actualizar un archivo existente cuando recibe el `sha` correcto.
- El flujo funciona para `hessamMahamud/wiseArchive`, `README.md` y la rama `main`.
- `npm run typecheck`, `npm test` y `npm run build` terminan correctamente.
- No se registra ni se devuelve `GITHUB_TOKEN`.

## Orden sugerido de implementación

1. Crear `file.schema.ts`.
2. Crear `clients/github/files.ts`.
3. Crear `tools/github/read_file.ts`.
4. Registrar la tool en `src/tools/index.tools.ts`.
5. Agregar pruebas unitarias y de handler.
6. Actualizar la documentación.
7. Ejecutar typecheck, tests y build.
8. Reiniciar el servidor MCP para que el cliente detecte la nueva tool.
