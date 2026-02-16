## Why

Actualmente, cuando se abre una carpeta que no tiene Git inicializado, el panel de Git en la interfaz no ofrece ninguna acción útil. El usuario no puede empezar a gestionar el control de versiones desde la aplicación y debe salir a la terminal para ejecutar `git init` manualmente. Esto rompe el flujo de trabajo integrado que la aplicación busca ofrecer.

## What Changes

Se agregará una opción visible en el panel de Git (GitPanel) para inicializar un repositorio Git cuando la carpeta actual no tenga uno. Esta opción permitirá al usuario comenzar el control de versiones directamente desde la interfaz sin salir de la aplicación.

## Capabilities

### New Capabilities

- `git-initialization`: Capacidad para inicializar un repositorio Git desde la interfaz de usuario cuando la carpeta abierta no tiene Git configurado.

### Modified Capabilities

<!-- Sin modificaciones a capacidades existentes -->

## Impact

- **UI Components**: `GitPanel.vue` necesitará mostrar un estado especial cuando no haya repositorio Git detectado, incluyendo un botón o mensaje de acción.
- **Backend/Services**: `GitService` (main process) necesitará exponer un método `initRepository` a través de IPC.
- **IPC Layer**: Nueva función `window.electron.git.initRepository(repoPath)`.
- **Stores**: `useFileSystemStore` o un nuevo store de Git podría necesitar detectar si la carpeta actual tiene Git inicializado.
