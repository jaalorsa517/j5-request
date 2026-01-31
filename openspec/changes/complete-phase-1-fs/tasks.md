## 1. Backend Core (Main Process)

- [x] 1.1 Implementar `createDirectory(path)` en `FileSystemService.ts` usando `mkdir recursive`.
- [x] 1.2 Implementar `renamePath(old, new)` en `FileSystemService.ts`.
- [x] 1.3 Implementar `deletePath(path)` en `FileSystemService.ts` usando `rm recursive`.

## 2. IPC & Preload

- [x] 2.1 Agregar handlers en `src/main/ipc.ts` para: `fs:create-dir`, `fs:rename`, `fs:delete`.
- [x] 2.2 Exponer estos métodos en `contextBridge` dentro de `src/preload/preload.ts`.
- [x] 2.3 Actualizar las definiciones de tipos de TypeScript para `window.electron.fs` (probablemente en `src/renderer/vite-env.d.ts` o `src/shared/types.ts`).

## 3. Frontend Store

- [x] 3.1 Agregar acción `createFolder(name)` en `src/renderer/stores/file-system.ts`.
- [x] 3.2 Agregar acción `renameItem(path, newName)` en `src/renderer/stores/file-system.ts`.
- [x] 3.3 Agregar acción `deleteItem(path)` en `src/renderer/stores/file-system.ts`.
