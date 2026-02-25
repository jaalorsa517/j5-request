## Context

En repositorios recién inicializados (`git init`), el módulo que interactúa con el cliente git en el main process falla al invocar comandos que dependen de comparar commits u obtener contenido de referencias como `HEAD`, porque al no haber ningún commit inicial, `HEAD` apunta a una resolución `invalid object name`. Al arrojar una excepción, los módulos IPC mandan la falla a la UI y ésta aborta mediante un modal de error ("Error fatal nombre de objeto no válido HEAD"), afectando la experiencia de revisión de primera carga.

## Goals / Non-Goals

**Goals:**
- Detectar y manejar la condición en la cual no exista un commit para el apuntador base (HEAD).
- Mitigar el error fatal originado al invocar métodos como `getFileContent` sobre el index o diff.
- Garantizar que si el archivo es nuevo y HEAD arroja error por inicio del repositorio, se retorne una cadena en blanco o nula en su contenido antiguo para alimentar el diff editor sin excepciones.

**Non-Goals:**
- Refactorización completa de los clientes u Object Managers de git.
- Modificar componentes visuales más allá de no ver el modal; la asimilación del editor a texto vacío funcionará naturalmente mostrando todo verde "added".

## Decisions

- **Validación al vuelo y Catch:** En los métodos como `getFileContent(filePath, commitHash)` (cuando `commitHash` es equivalente a referenciar `HEAD`), hacer un `try...catch`. Si el error arrojado coincide con "nombre de objeto no válido" ("bad object" / "invalid object name"), sabremos que no hay historial contra qué comparar y retornaremos simplemente `""`.
- Alternativamente, realizar validación previa revisando indirectamente `git rev-parse HEAD` para comprobar existencia; pero en cuestiones de costo, el `catch` particular del mensaje evita lanzamientos redundantes a la consola shell.
- Proveer soporte en IPC y `GitService` para pasar la excepción y convertirla en una ejecución fallida de la cual el Frontend pueda recuperarse, devolviendo éxito con texto vacío ("").

## Risks / Trade-offs

- Enjaular o silenciar un error general del shell en git limitaría la visualización de problemas reales (e.g. archivo corrupto, binario imposible de abrir). Este es un riesgo controlable siempre que matchemos (match) la cadena de la excepción provista de git directamente, es decir, validar explícitamente el `HEAD` name.
