## 1. Backend (GitService y IPC)

- [ ] 1.1 Agregar método `isRepository(repoPath: string): Promise<boolean>` en `src/main/services/GitService.ts`.
- [ ] 1.2 Agregar método `initRepository(repoPath: string): Promise<void>` en `src/main/services/GitService.ts` usando `simpleGit(repoPath).init()`.
- [ ] 1.3 Exponer `isRepository` y `initRepository` en el preload script (`src/preload/index.ts`) bajo `window.electron.git`.
- [ ] 1.4 Actualizar el type definition en `src/global.d.ts` para incluir las nuevas firmas IPC.

## 2. Frontend (GitPanel UI)

- [ ] 2.1 Modificar `GitPanel.vue` para llamar a `window.electron.git.isRepository(currentPath)` al montar o cuando cambie la carpeta.
- [ ] 2.2 Agregar un estado local `hasGitRepo` (ref booleano) que almacene el resultado de `isRepository()`.
- [ ] 2.3 Mostrar un bloque "empty state" (similar a EnvironmentManagerModal) cuando `hasGitRepo` sea `false`, con un mensaje y botón "Inicializar Git".
- [ ] 2.4 Implementar el handler del botón que llame a `window.electron.git.initRepository(currentPath)`.
- [ ] 2.5 Después de la inicialización exitosa, volver a ejecutar `isRepository()` para actualizar el estado y mostrar el panel normal.
- [ ] 2.6 Manejar errores de `initRepository()` mostrando un mensaje de error claro (alert o toast).

## 3. Pruebas

- [ ] 3.1 Crear test unitario para `GitService.isRepository()` verificando carpetas con y sin `.git/`.
- [ ] 3.2 Crear test unitario para `GitService.initRepository()` verificando que se crea `.git/` correctamente.
- [ ] 3.3 Crear test de componente para `GitPanel.vue` simulando el flujo de no-repo → init → repo activo.

## 4. Validación Manual

- [ ] 4.1 Abrir una carpeta SIN Git y verificar que aparece el mensaje de "No hay repositorio Git".
- [ ] 4.2 Hacer clic en "Inicializar Git" y verificar que el panel cambia al estado normal de Git.
- [ ] 4.3 Abrir una carpeta CON Git y verificar que el panel muestra el estado de Git correctamente desde el inicio.
