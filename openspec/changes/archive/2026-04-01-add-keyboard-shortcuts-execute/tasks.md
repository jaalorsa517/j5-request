## 1. Refactorización de Lógica de Ejecución

- [x] 1.1 Asegurar que `useRequestStore` tiene una acción centralizada para disparar el envío de la petición actual (ej. `sendRequest`).
- [x] 1.2 Vincular el botón "Send" de la UI a esta acción centralizada si no lo está.

## 2. Integración en UrlBar

- [x] 2.1 Agregar el modificador `@keydown.ctrl.enter` al campo de entrada de URL en `UrlBar.vue`.
- [x] 2.2 Agregar el modificador `@keydown.meta.enter` al campo de entrada de URL en `UrlBar.vue`.
- [x] 2.3 Invocar la acción de envío desde estos eventos.

## 3. Integración en Monaco Editor

- [x] 3.1 Localizar la inicialización de Monaco en `MonacoEditor.vue`.
- [x] 3.2 Implementar `editor.addCommand` para mapear `CtrlCmd + Enter` a una función que emita un evento personalizado o llame directamente al store.
- [x] 3.3 Asegurar que el comando prevente el comportamiento por defecto (salto de línea) dentro de Monaco.

## 4. Pruebas y Validación

- [x] 4.1 Verificar que Ctrl+Enter ejecuta la petición cuando el foco está en la URL.
- [x] 4.2 Verificar que Ctrl+Enter ejecuta la petición cuando el foco está en el Editor de Body.
- [x] 4.3 Comprobar que no se insertan caracteres no deseados en el editor al usar el atajo.
- [x] 4.4 Verificar compatibilidad básica con macOS (usando `meta` y `CtrlCmd`).
