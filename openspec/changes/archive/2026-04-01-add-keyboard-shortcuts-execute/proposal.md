## Why

Los usuarios necesitan una forma más rápida y eficiente de ejecutar las peticiones HTTP sin depender exclusivamente de la interacción con el ratón. Implementar atajos de teclado estándar (como Ctrl+Enter) mejora la ergonomía y la productividad del flujo de trabajo "API-as-Code".

## What Changes

- Implementación de atajos de teclado para la ejecución de peticiones:
    - **Ctrl + Enter** (Windows/Linux)
    - **Cmd + Enter** (macOS)
- Los atajos deben ser funcionales tanto en la barra de dirección (`UrlBar`) como en el editor de cuerpo de mensaje (`MonacoEditor`).
- Retroalimentación visual mínima para indicar que la ejecución ha sido disparada por teclado.

## Capabilities

### New Capabilities
- `keyboard-shortcuts`: Gestión centralizada de atajos de teclado y comandos dentro de la aplicación.

### Modified Capabilities
- `ui-request-layout`: Actualización de los componentes de edición para interceptar y delegar eventos de teclado al ejecutor.
- `ui-editor-monaco`: Configuración del editor para soportar atajos de teclado personalizados sin interferir con los comandos nativos de Monaco.

## Impact

- **Componentes**: `RequestPanel.vue`, `UrlBar.vue`, `MonacoEditor.vue`.
- **Stores**: Potencialmente `useRequestStore` para centralizar la acción de disparo.
- **Main/Preload**: Posible registro de atajos globales si se requiere, aunque se priorizarán atajos contextuales de ventana.
