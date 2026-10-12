# Especificación: tool `get_repository`

## Objetivo

Agregar una tool MCP de solo lectura que consulte un repositorio de GitHub y devuelva información básica normalizada. Esta tool forma parte del alcance confirmado en [`spec-terminacion.md`](./spec-terminacion.md) y debe implementarse antes de considerar terminado el servidor AutomateHub.

## Contrato MCP

Nombre: `get_repository`

La descripción debe indicar que la operación solo consulta GitHub y no crea ni modifica recursos.

### Entrada

```ts
{
  owner: string;
  repo: string;
}
```

Reglas:

- `owner` es obligatorio y no puede estar vacío.
- `repo` es obligatorio y no puede estar vacío.
- Los valores deben recortarse antes de validarse.
- No se deben aceptar valores que puedan producir una llamada ambigua a GitHub.

### Salida exitosa

```ts
{
  ok: true;
  data: {
    full_name: string;
    url: string;
    description: string | null;
    private: boolean;
    owner: string;
    default_branch: string;
  }
}
```

La salida debe reutilizar la forma normalizada de repositorio existente y ampliarla con `default_branch` si el schema actual no lo contempla.

## Archivos a modificar o crear

### `src/schemas/repositories.schema.ts`

- Crear un schema de entrada para `get_repository`.
- Crear o ampliar el schema de salida con `default_branch`.
- Mantener separados los campos de creación, listado y consulta individual cuando sus contratos sean diferentes.

### `src/clients/github/repositories.ts`

Agregar una función `getRepository(client, owner, repo)` que llame a:

```ts
client.repos.get({ owner, repo })
```

Debe mapear la respuesta de Octokit a la salida pública de la tool y no exponer headers, tokens ni datos innecesarios.

### `src/tools/github/get_repository.ts`

Convertir el archivo existente en el registro de la tool siguiendo el patrón del resto del proyecto:

1. Validar con el schema de entrada.
2. Llamar al cliente de repositorios.
3. Responder mediante `toolSuccess`.
4. Convertir fallos mediante `toolFailure`.

### `src/tools/index.tools.ts`

Registrar `registerGetRepository(server, githubClient)` en `registerAllTools`.

### Tests

Agregar cobertura para:

- entrada válida;
- `owner` vacío;
- `repo` vacío;
- transformación de la respuesta de `repos.get`;
- llamada correcta a Octokit;
- repositorio inexistente (`404`);
- credenciales inválidas (`401`);
- permisos insuficientes (`403`);
- respuesta MCP exitosa y respuesta de error.

## Flujo esperado

```text
LLM/Host -> get_repository(owner, repo)
         -> Zod valida los datos
         -> Octokit repos.get
         -> resultado normalizado o error legible
```

## Criterios de aceptación

- La tool aparece al descubrir las capacidades del servidor.
- Es de solo lectura y no ejecuta operaciones de escritura.
- Devuelve la rama principal y la información básica del repositorio.
- Rechaza entradas vacías antes de llamar a GitHub.
- Sus tests usan mocks y no un token real.
- Está documentada en el README con parámetros, respuesta, errores y prompt efectivo.
- `npm run typecheck`, `npm test` y `npm run build` pasan después de su implementación.

## Prompt de ejemplo

> Consulta `hessamMahamud/wiseArchive` y dime su URL, descripción, visibilidad y rama principal. No modifiques nada.

## Fuera de alcance

- Crear o modificar repositorios.
- Listar todos los repositorios de la cuenta.
- Consultar issues, commits o archivos del repositorio.
