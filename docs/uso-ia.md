# Uso de LLM durante la creación de AutomateHub

## Propósito

Este documento registra cómo se utilizó un LLM durante el desarrollo de AutomateHub, un servidor MCP para GitHub. La IA se utilizó como tutor y asistente de revisión, no como sustituto de la comprensión del código.

## Rol solicitado al LLM

El rol definido para la asistencia fue **tutor de programación**. Las reglas principales fueron:

- explicar primero el concepto y después la sintaxis;
- avanzar mediante objetivos, piezas necesarias y esqueletos guiados;
- hacer preguntas que ayuden a razonar de forma autónoma;
- explicar código línea por línea cuando fuera necesario;
- priorizar la comprensión sobre la velocidad;
- modificar pocos archivos por vez;
- usar un modo de emergencia gradual cuando apareciera un bloqueo;
- no modificar código sin explicar antes el cambio y obtener aprobación.

La definición completa de este comportamiento se encuentra en [`docs/prompt.json`](./prompt.json).

## Usos concretos del LLM

### 1. Revisión del alcance

Se utilizó el LLM para comparar el estado del repositorio con los requisitos del proyecto: tools de GitHub, schemas de Zod, configuración MCP, tests y documentación.

### 2. Elaboración de la especificación

La revisión produjo [`docs/spec-terminacion.md`](./spec-terminacion.md), que separa lo cumplido, lo parcial y lo pendiente. La especificación también registra las decisiones del proyecto:

- utilizar `.codex` desde VSCode;
- crear `get_repository`;
- pedir aprobación antes de tocar código;
- ejecutar tests únicamente contra mocks.

### 3. Diagnóstico de configuración y red

Se analizó la relación entre `.codex/mcp.json`, el servidor local y la conexión con GitHub. Se distinguió entre:

- la configuración MCP, que inicia el proceso local por `stdio`;
- el entorno de ejecución, que puede bloquear la red saliente;
- la autenticación de GitHub, cargada mediante `GITHUB_TOKEN`.

### 4. Diseño de documentación

El LLM ayudó a estructurar el README, el catálogo de tools, la explicación de arquitectura, la guía de seguridad y los criterios de testing. La documentación final debe mantenerse alineada con el código real y señalar explícitamente las funcionalidades aún pendientes.

## Evidencia y control humano

Las decisiones importantes fueron revisadas por el autor del proyecto. En particular, el autor confirmó que:

1. `.codex` y VSCode serán el entorno Host.
2. `get_repository` debe formar parte del alcance.
3. Los cambios de código requieren una propuesta previa y aprobación explícita.
4. Las pruebas deben utilizar mocks y no deben llamar a GitHub real.

## Límites de la asistencia

- La IA no debe inventar que una tool está implementada si el código no la registra.
- La IA no debe incluir tokens reales en archivos, logs o respuestas.
- Las pruebas automáticas no deben depender de red, credenciales ni recursos externos.
- Las operaciones de escritura sobre GitHub requieren una intención explícita y no forman parte de la suite de tests.
- La documentación debe distinguir entre código existente, código pendiente y propuestas futuras.

## Resultado esperado

El resultado de usar el LLM no es solo producir archivos, sino dejar una explicación verificable de:

- qué problema resuelve cada componente;
- por qué se eligió cada librería;
- cómo se validan los inputs;
- cómo se transforman los errores;
- cómo se conecta el servidor con el Host MCP;
- cómo se prueban las operaciones sin modificar GitHub real.

## Reproducción de la bitácora

Para continuar el trabajo, cada cambio de código debe registrarse con:

- objetivo del cambio;
- archivos afectados;
- explicación conceptual;
- requisito que cubre;
- propuesta de tests con mocks;
- aprobación del autor antes de editar.

