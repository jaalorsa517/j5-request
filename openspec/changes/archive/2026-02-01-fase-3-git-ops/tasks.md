## 1. Backend & IPC (Main Process)

- [x] 1.1 Instalar dependencia `simple-git`.
- [x] 1.2 Crear servicio `GitService` en el proceso principal para encapsular lógica de `simple-git`.
- [x] 1.3 Implementar método `getStatus(path)` en `GitService`.
- [x] 1.4 Implementar métodos `stage`, `unstage`, `commit`, `push`, `pull`, `checkout`, `getBranches` en `GitService`.
- [x] 1.5 Crear handlers IPC para exponer estos métodos al Renderer (`git:status`, `git:stage`, `git:commit`, etc).
- [x] 1.6 Implementar lógica de descubrimiento de repositorios en el workspace (detectar `.git` folders).

## 2. Frontend State (Store)

- [x] 2.1 Crear `useGitStore` con Pinia.
- [x] 2.2 Definir estado para: `repositories` (lista), `selectedRepo`, `status` (staged/unstaged files), `currentBranch`.
- [x] 2.3 Implementar acciones para invocar los IPC handlers y actualizar el estado.

## 3. UI Components

- [x] 3.1 Crear componente base `GitPanel.vue` para el sidebar.
- [x] 3.2 Crear componente `GitRepositoryItem` para mostrar cabecera de repositorio y rama actual.
- [x] 3.3 Crear componente `GitChangesList` para listar archivos modificados/staged.
- [x] 3.4 Crear componente `GitCommitBox` (textarea para mensaje + botón commit).
- [x] 3.5 Integrar visualización de iconos de estado (modificado, nuevo, borrado).

## 4. Diff View & Integration

- [x] 4.1 Crear vista/componente `DiffEditor` usando `monaco-editor`.
- [x] 4.2 Implementar lógica para abrir el DiffEditor al hacer clic en un archivo del `GitChangesList`.
- [x] 4.3 Obtener contenido original (HEAD) mediante `git show HEAD:path` (necesita nuevo IPC handler) y contenido actual de disco.

## 5. Testing & Polishing

- [x] 5.1 Verificar flujo E2E: cambio archivo -> aparece en lista -> stage -> commit -> desaparece.
- [x] 5.2 Validar manejo de errores (ej. fallo en commit vacio, fallo auth en push).
