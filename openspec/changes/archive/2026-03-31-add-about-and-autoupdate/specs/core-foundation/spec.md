## MODIFIED Requirements

### Requirement: Inicialización del Proyecto
El sistema debe estar configurado como una aplicación Electron funcional con soporte para Vue 3 y TypeScript, incluyendo ahora la infraestructura para actualizaciones automáticas.

#### Scenario: Arranque de la aplicación
- **WHEN** El desarrollador ejecuta `npm run dev`
- **THEN** Se debe abrir una ventana de Electron mostrando la interfaz base de Vue.
- **AND** La consola no debe mostrar errores de configuración de TypeScript.
- **AND** El sistema SHALL inicializar el proceso de verificación de actualizaciones automáticas.

### Requirement: Estructura de Persistencia
El sistema debe reconocer y respetar la estructura de carpetas definida para el código fuente, incluyendo los nuevos activos y configuraciones de construcción.

#### Scenario: Organización de código
- **WHEN** Se inspecciona el directorio `src`
- **THEN** Deben existir subdirectorios claros para `main`, `preload`, `renderer` y `shared`.
- **AND** Los archivos de configuración de `electron-builder` SHALL estar actualizados para soportar el canal de actualizaciones.
