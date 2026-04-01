## Context

La aplicación carece de una forma rápida de ejecutar peticiones mediante el teclado. Los componentes principales (`UrlBar` y `MonacoEditor`) no tienen oyentes para combinaciones de teclas de ejecución.

## Goals / Non-Goals

**Goals:**
- Implementar el atajo `Ctrl + Enter` (y `Cmd + Enter` en macOS) para disparar la ejecución de la petición.
- Asegurar que el atajo funcione independientemente de si el foco está en la barra de URL o en el editor de cuerpo.
- Centralizar la lógica de disparo en el store de Pinia.

**Non-Goals:**
- Implementar un sistema complejo de gestión de atajos configurables por el usuario (se mantendrán fijos por ahora).
- Atajos para otras acciones (Guardar, Nueva Pestaña, etc.) - estos vendrán en cambios posteriores.

## Decisions

### 1. Intercepción en Monaco Editor
Monaco tiene su propio sistema de gestión de teclado que suele bloquear los eventos de burbujeo estándar de la web.
- **Decisión**: Utilizar `editor.addCommand` en el componente `MonacoEditor.vue` para registrar `monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter`.
- **Razón**: Es la forma oficial y más robusta de añadir comandos al editor sin interferir con su comportamiento interno.

### 2. Intercepción en Vue Components (UrlBar)
- **Decisión**: Usar los modificadores de eventos de Vue `@keydown.ctrl.enter` y `@keydown.meta.enter` en el input de la URL.
- **Razón**: Simplifica la implementación y aprovecha las capacidades nativas del framework.

### 3. Centralización en `RequestStore`
- **Decisión**: Crear o reutilizar una acción `sendActiveRequest()` en el store.
- **Razón**: Garantiza que el comportamiento sea idéntico tanto si se pulsa el botón como si se usa el teclado.

## Risks / Trade-offs

- **[Risk] Conflicto con Monaco** → Monaco por defecto usa `Ctrl+Enter` para insertar línea arriba/abajo en algunos modos.
    - *Mitigación*: El comando registrado explícitamente tiene prioridad en Monaco.
- **[Trade-off] Detección de OS** → Necesitamos asegurar que `Cmd` se detecte correctamente en Mac y `Ctrl` en el resto.
    - *Mitigación*: Vue maneja `.meta` y `.ctrl` por separado; Monaco usa el flag unificado `KeyMod.CtrlCmd`.
