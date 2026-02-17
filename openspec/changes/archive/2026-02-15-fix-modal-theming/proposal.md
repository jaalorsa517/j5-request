## Why

Actualmente, los modales de la aplicación no heredan ni aplican correctamente los estilos del tema seleccionado (oscuro/claro). Esto resulta en problemas de legibilidad (ej. texto oscuro sobre fondo oscuro) o inconsistencia visual con el resto de la interfaz, afectando negativamente la experiencia de usuario.

## What Changes

Se revisarán y ajustarán todos los componentes modales para que utilicen las variables CSS semánticas del sistema de temas. Esto asegurará que los fondos, textos y bordes de los modales se adapten dinámicamente al cambio de tema, manteniendo la consistencia visual y la legibilidad.

## Capabilities

### New Capabilities
<!-- Sin nuevas capacidades funcionales -->

### Modified Capabilities

- `ui-theming`: Se amplía el alcance del requisito de consistencia visual para incluir explícitamente los componentes modales y overlays.

## Impact

- **UI Components**: `EnvironmentManagerModal.vue`, `MainLayout.vue` (modal de new request), y cualquier otro componente modal.
- **Styles**: Ajustes en `style.css` si faltan variables específicas para modales.
