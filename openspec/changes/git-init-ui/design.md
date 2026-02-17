## Context

Actualmente, `GitPanel.vue` asume que siempre hay un repositorio Git presente y llama a `window.electron.git.getStatus()` sin validar primero. Si no hay repositorio, esto genera errores. No existe un flujo UI para inicializar Git directamente desde la aplicación.

La aplicación ya tiene `GitService` en el proceso principal que utiliza `simple-git`, por lo que agregar `git init` es técnicamente sencillo. El desafío es diseñar la UX para que sea clara y no confunda al usuario.

## Goals / Non-Goals

**Goals:**
- Detectar cuando la carpeta abierta NO tiene Git inicializado.
- Mostrar un mensaje claro en `GitPanel` invitando al usuario a inicializar Git.
- Proveer un botón/action para ejecutar `git init` en la carpeta actual.
- Actualizar la UI automáticamente después de la inicialización exitosa.

**Non-Goals:**
- Configuración avanzada de Git (nombre, correo, remote) durante la inicialización. Eso se puede hacer después.
- Interfaz para clonar repositorios remotos (fuera de este scope).

## Decisions

### 1. Detección de Repositorio Git
- **Decisión**: Agregar un método `window.electron.git.isRepository(path)` que retorne `true/false`.
- **Alternativa considerada**: Intentar `getStatus()` y capturar el error. Rechazada porque es menos clara y puede generar logs confusos.
- **Razón**: Separar la validación del estado permite manejar la UI de forma más limpia.

### 2. Ubicación del Botón de Inicialización
- **Decisión**: Mostrar un estado "empty" en `GitPanel` (similar al "no-env" en EnvironmentManagerModal) con un botón "Inicializar Git".
- **Alternativa considerada**: Un modal de confirmación. Rechazada porque añade fricción innecesaria para una operación simple.
- **Razón**: Menos pasos para el usuario, flujo más directo.

### 3. Implementación del Init en GitService
- **Decisión**: Usar `simpleGit(repoPath).init()`.
- **Razón**: `simple-git` ya está como dependencia y tiene soporte nativo para `git init`.

### 4. Actualización de UI Post-Init
- **Decisión**: Después de `initRepository()`, emitir un evento o re-ejecutar la verificación de estado.
- **Razón**: Evitar que el usuario tenga que cerrar/abrir la carpeta para ver el cambio.

## Risks / Trade-offs

- **Risk**: Si el usuario inicializa Git accidentalmente en una carpeta incorrecta, podría contaminar su filesystem.
  - **Mitigation**: Mostrar la ruta completa en el mensaje de confirmación antes de inicializar. No auto-inicializar sin acción explícita del usuario.

- **Risk**: Si `git init` falla (permisos, disco lleno), el error debe comunicarse claramente.
  - **Mitigation**: Capturar excepciones en `GitService.initRepository()` y mostrar un mensaje de error en la UI usando un mecanismo similar al `alert()` actual o un toast notification.
