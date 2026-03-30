## Why

Las especificaciones actuales están desfasadas respecto a la implementación reciente del sistema de diseño basado en tokens y la nueva identidad visual de la aplicación. Es necesario sincronizar la documentación para reflejar la arquitectura de UI real y las nuevas capacidades de diseño para mantener la coherencia entre el código y los requisitos.

## What Changes

- **Sincronización de Design Tokens**: Incorporar formalmente el sistema de variables CSS semánticas (Surfaces & Elevation, Typography) en las especificaciones.
- **Identidad Visual (Branding)**: Documentar el uso de los colores de marca oficiales de J5-Request y la nueva iconografía de la aplicación.
- **Configuración de Build**: Reflejar los cambios en `electron-builder.json5` y dependencias de infraestructura (Vite/Vitest) realizados en marzo.
- **Skill de Diseño**: Integrar la capacidad de diseño de interfaz (`interface-design`) en los specs de herramientas y flujos de trabajo del agente.

## Capabilities

### New Capabilities
- `interface-design-infrastructure`: Define las directrices y herramientas del agente para el diseño de interfaces siguiendo los estándares del proyecto.

### Modified Capabilities
- `ui-theming`: Actualizar para incluir el sistema de tokens semánticos más allá del simple soporte Dark/Light.
- `core-foundation`: Incluir la definición de activos visuales (iconos) y colores de marca como parte de la base del proyecto.

## Impact

- `src/renderer/style.css`: Archivo principal de tokens.
- `electron-builder.json5` y `package.json`: Configuración de construcción y dependencias.
- `openspec/specs/`: Actualización de archivos de especificación existentes.
- `.agent/skills/interface-design/`: Nueva documentación de capacidades del agente.
