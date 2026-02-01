## 1. Instalación de Dependencias

- [x] 1.1 Instalar `monaco-editor` y `@guolao/vue-monaco-editor` (o wrapper equivalente).
- [x] 1.2 Configurar Vite para code-splitting de Monaco (evitar bundle inicial pesado).

## 2. Store de Request (Pinia)

- [x] 2.1 Crear `src/renderer/stores/request.ts` con estado para: `method`, `url`, `headers`, `params`, `body`, `response`.
- [x] 2.2 Implementar acción `loadFromFile(request: J5Request)` para hidratar el store desde `FileSystemStore`.
- [x] 2.3 Implementar acción `saveToFile()` que invoque `FileSystemStore.saveRequest()`.
- [x] 2.4 Implementar computed `isDirty` para detectar cambios sin guardar.

## 3. Componentes de Editor Monaco

- [x] 3.1 Crear componente `MonacoEditor.vue` reutilizable con props: `modelValue`, `language`, `readOnly`.
- [x] 3.2 Configurar opciones de Monaco: tema (dark/light), validación JSON, formateo automático.
- [x] 3.3 Implementar eventos `update:modelValue` para sincronización bidireccional.

## 4. Panel de Petición (Request Panel)

- [x] 4.1 Crear componente `UrlBar.vue` con selector de método HTTP y campo de URL.
- [x] 4.2 Crear componente `RequestTabs.vue` con pestañas: Headers, Params, Body.
- [x] 4.3 Crear componente `KeyValueEditor.vue` para gestión de Headers/Params (tabla editable con checkbox enable/disable).
- [x] 4.4 Crear componente `RequestBodyEditor.vue` que use `MonacoEditor` en modo editable.
- [x] 4.5 Integrar todos los subcomponentes en `RequestPanel.vue`.

## 5. Panel de Respuesta (Response Panel)

- [x] 5.1 Crear componente `ResponseMeta.vue` para mostrar: código de estado, tiempo, tamaño.
- [x] 5.2 Implementar lógica de colores para códigos de estado (2xx verde, 3xx amarillo, 4xx-5xx rojo).
- [x] 5.3 Crear componente `ResponseBodyViewer.vue` que use `MonacoEditor` en modo `readOnly`.
- [x] 5.4 Integrar subcomponentes en `ResponsePanel.vue`.

## 6. Layout Principal

- [x] 6.1 Crear componente `MainLayout.vue` con estructura split-pane (Sidebar + Workspace).
- [x] 6.2 Integrar `Sidebar` (árbol de archivos existente) en el layout.
- [x] 6.3 Integrar `RequestPanel` y `ResponsePanel` en el área de Workspace.
- [x] 6.4 Configurar responsividad del layout (redimensionable si es posible).

## 7. Integración con FileSystemStore

- [x] 7.1 Modificar `FileSystemStore.selectFile()` para invocar `RequestStore.loadFromFile()` automáticamente.
- [x] 7.2 Conectar botón "Save" de la UI con `RequestStore.saveToFile()`.
- [x] 7.3 Mostrar indicador visual de "dirty state" (cambios sin guardar) en la UI.

## 8. Pruebas de Integración

- [x] 8.1 Verificar que al seleccionar un archivo, el contenido se carga correctamente en el editor.
- [x] 8.2 Verificar que los cambios en el editor actualizan el store.
- [x] 8.3 Verificar que guardar persiste los cambios en disco.
- [x] 8.4 Verificar que el modo read-only funciona correctamente en el visor de respuestas.
