## Why

Actualmente, aunque la aplicación cuenta con un gestor de temas (`useThemeStore`) que soporta modos claro y oscuro, carece de un control visual accesible para que el usuario pueda alternar entre ellos a voluntad. Además, existen inconsistencias visuales (bugs) críticas cuando se activa el modo claro, especialmente en componentes como `RequestTabBar`, donde los estilos no se adaptan correctamente, afectando degradando la experiencia de usuario.

## What Changes

Se implementará un componente visual (botón toggle) visible en la interfaz principal para cambiar el tema. Adicionalmente, se realizará una revisión y corrección de estilos CSS para garantizar que todos los componentes, especialmente las pestañas y paneles, se visualicen correctamente tanto en modo claro como oscuro.

## Capabilities

### New Capabilities
<!-- Ninguna nueva capacidad funcional, es extensión de la existente -->

### Modified Capabilities

- `ui-theming`: Se añade el requisito de un control de interfaz de usuario explícito para el cambio de tema.
- `workspace-tabs`: Se modifica el requisito de visualización para asegurar legibilidad y contraste adecuado en ambos temas.

## Impact

- **UI/UX**: Nuevo elemento en la barra de actividad o header. Cambios en `RequestTabBar`, `MainLayout` y variables CSS globales.
- **Components**: `RequestTabBar.vue`, `MainLayout.vue`, `style.css`.
