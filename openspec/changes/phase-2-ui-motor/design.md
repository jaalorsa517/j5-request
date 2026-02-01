## Context

La Fase 1 entregó la capacidad de leer y escribir archivos. Ahora construiremos la interfaz de usuario (Fase 2). La aplicación necesita una forma ergonómica de editar JSON y visualizar respuestas HTTP.

## Goals / Non-Goals

**Goals:**
- Implementar la vista principal de trabajo (`MainLayout`).
- Integrar Monaco Editor para edición de Request Body y visualización de Response Body.
- Crear stores de Pinia para manejar el estado de la UI de la petición (`useRequestStore`).
- Conectar la selección de archivos del sistema de archivos con el editor.

**Non-Goals:**
- Ejecución real de la petición HTTP (Fase 4: Ejecutor). Por ahora, el botón "Enviar" solo simulará o estará deshabilitado, o enviará mock data si se requiere testear UI.
- Gestión de ramas Git (Fase 3).

## Decisions

### 1. Librería de Editor
Utilizaremos `monaco-editor` directamente o a través de un wrapper ligero como `@guolao/vue-monaco-editor`.
*Rationale*: Es el estándar de industria (VS Code), ofrece la mejor experiencia de edición JSON y validación de esquemas.

### 2. Gestión de Estado (Store Separation)
Separaremos claramente el estado del sistema de archivos del estado de la UI:
- `FileSystemStore`: Verdad absoluta del disco (Fase 1).
- `RequestStore` (Nuevo): Estado efímero de lo que se está editando.
  - Al seleccionar un archivo: `FileSystemStore` -> carga contenido -> `RequestStore` se hidrata.
  - Al guardar: `RequestStore` -> valida -> `FileSystemStore` -> escribe a disco.
Esto permite "dirty states" (cambios sin guardar) sin corromper la cache del disco.

### 3. Arquitectura de Componentes
- `MainLayout`: Contenedor principal.
- `Sidebar`: Árbol de archivos (ya existente/a integrar).
- `Workspace`: Área central.
  - `RequestPanel`:
    - `UrlBar`: Método, URL, Botón Send.
    - `RequestTabs`: Params, Headers, Body, Auth.
    - `RequestBodyEditor`: Instancia de Monaco editable.
  - `ResponsePanel`:
    - `ResponseMeta`: Status, Time, Size.
    - `ResponseBodyViewer`: Instancia de Monaco read-only.

## Risks / Trade-offs

- **Peso del Bundle**: Monaco es pesado.
  - *Mitigación*: Usar importación dinámica (`defineAsyncComponent` o configuración de Vite para chunks separados) para no bloquear la carga inicial.
- **Complejidad de Sincronización**: Mantener sincronizado el editor con el store requiere cuidado (two-way binding manual vs eventos).
  - *Decisión*: Usar eventos `onChange` del editor para actualizar el store (one-way data flow preferible).
