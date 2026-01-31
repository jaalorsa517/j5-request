## 1. Definición de Tipos y Esquemas

- [x] 1.1 Crear `src/shared/types.ts` con las interfaces `J5Request`, `J5Collection` y `J5FileEntry`.
- [x] 1.2 Implementar utilidades de validación y ordenamiento de JSON en `src/shared/utils/json-helpers.ts`.

## 2. Main Process - FileSystem Service

- [x] 2.1 Instalar dependencias necesarias (`chokidar` si no está, aunque `fs/promises` es nativo).
- [x] 2.2 Crear `src/main/services/FileSystemService.ts` con métodos `readDirRecursive`, `readFile`, `writeFile`.
- [x] 2.3 Implementar lógica de filtrado (ignorar `.git`, `node_modules`).
- [x] 2.4 Configurar el watcher (`chokidar`) para emitir eventos de cambio al renderer.
- [x] 2.5 Exponer métodos a través de IPC en `src/main/ipc.ts` y conectarlos en `src/preload/index.ts` (o `preload.ts`).

## 3. Renderer Process - Gestión de Estado

- [x] 3.1 Crear el store de Pinia `src/renderer/stores/file-system.ts`.
- [x] 3.2 Implementar acciones para abrir directorio, seleccionar archivo y guardar archivo.
- [x] 3.3 Escuchar eventos del watcher desde IPC para actualizar el árbol en tiempo real.

## 4. Renderer Process - Interfaz de Usuario

- [x] 4.1 Crear componente `FileTree.vue` recursivo para mostrar la estructura de carpetas.
- [x] 4.2 Crear componente `RequestEditor.vue` básico (campos de texto para URL, método) vinculado al archivo seleccionado.
- [x] 4.3 Integrar todo en `App.vue` con un layout de paneles (Sidebar pasivo).
