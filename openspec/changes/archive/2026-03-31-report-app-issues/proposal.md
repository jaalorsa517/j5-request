## Why

Actualmente, no existe un mecanismo directo dentro de la aplicación para que los usuarios reporten errores o sugieran mejoras. Esto obliga a los usuarios a buscar manualmente el repositorio en GitHub, lo que genera fricción y reduce la cantidad de retroalimentación recibida. Proporcionar un acceso directo mejora la experiencia del usuario y facilita el mantenimiento del proyecto.

## What Changes

- Adición de un botón "Reportar un problema" en el modal "Acerca de".
- Implementación de lógica para abrir el navegador predeterminado directamente en la página de creación de "New Issue" del repositorio de GitHub.
- Pre-poblado opcional del título o cuerpo del issue con información básica de la versión de la aplicación.

## Capabilities

### New Capabilities
- `issue-reporting`: Proporciona la interfaz y la lógica para redirigir al usuario al sistema de reporte de errores externo (GitHub).

### Modified Capabilities
- `application-info`: Se modifica el diálogo de información para incluir el nuevo acceso de reporte.

## Impact

- `src/renderer/components/AboutModal.vue`: Se añadirá el botón de reporte.
- `src/main/ipc.ts`: Se utilizará el manejador `app:openExternal` ya existente.
- `README.md`: Se mencionará la facilidad de reporte desde la app.
