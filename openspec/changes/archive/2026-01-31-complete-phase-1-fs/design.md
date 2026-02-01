## Context

La Fase 1 ("Core & Sistema de Archivos") ha establecido la capacidad de lectura recursiva y escritura de archivos de petición. Sin embargo, para cumplir con la visión de "Gestión de Colecciones" sin salir de la aplicación, es necesario implementar la lógica de mutación de la estructura de directorios y archivos.

## Goals / Non-Goals

**Goals:**
- Implementar métodos robustos en `FileSystemService` para `createDirectory`, `rename` y `delete`.
- Exponer estos métodos de forma segura a través de `ipcMain` y `contextBridge`.
- Actualizar `useFileSystemStore` para consumir estas nuevas capacidades.
- Manejar errores comunes del sistema de archivos (permisos, archivos inexistentes, colisiones de nombres).

**Non-Goals:**
- Crear la interfaz de usuario final (botones, modales, menús contextuales) para invocar estas acciones. Eso corresponde a la Fase 2.
- Implementar operaciones de "Deshacer" (Undo) por ahora.
- Mover archivos entre directorios (Drag & Drop), esto queda para una iteración futura o Fase 2/3.

## Decisions

### 1. API del Servicio de Archivos
Se añadirán los siguientes métodos a `FileSystemService`:
- `createDirectory(path: string): Promise<void>`: Usará `mkdir` con `recursive: true`.
- `deletePath(path: string): Promise<void>`: Usará `rm` con `recursive: true` para permitir borrar carpetas con contenido.
- `renamePath(oldPath: string, newPath: string): Promise<void>`: Usará `rename` estándar.

### 2. Manejo de Errores e IPC
El backend capturará errores de bajo nivel del sistema de archivos y lanzará excepciones que serán transmitidas a través del IPC. El frontend será responsable de capturar (`try/catch`) estas promesas y notificar al usuario (aunque la notificación visual sea parte de Fase 2, el store debe manejar el estado de error).

### 3. Integración con Watcher
Dado que ya tenemos un `watcher` (chokidar) implementado en Fase 1, las operaciones de escritura (crear, borrar, renombrar) dispararán eventos del sistema de archivos.
**Decisión**: No actualizaremos manualmente el estado del árbol de archivos (`rootEntry`) después de una operación. Confiaremos en el evento `all` del watcher que ya invoca `loadDirectory()` en el frontend. Esto simplifica la lógica y garantiza una única fuente de verdad.

## Risks / Trade-offs

- **Dependencia del Watcher**: Si el watcher es lento, la UI podría tardar unos milisegundos en reflejar el cambio después de que la promesa se resuelva.
  - *Mitigación*: Aceptable para MVP. Si es crítico, se puede forzar un reload manual, pero confiar en el watcher es más robusto para consistencia externa.
- **Borrado Accidental**: `deletePath` será recursivo y definitivo.
  - *Mitigación*: En el Core solo proveemos la herramienta. La UI (Fase 2) deberá implementar diálogos de confirmación.
