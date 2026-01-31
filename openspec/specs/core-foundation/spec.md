## ADDED Requirements

### Requirement: Inicialización del Proyecto
El sistema debe estar configurado como una aplicación Electron funcional con soporte para Vue 3 y TypeScript.

#### Scenario: Arranque de la aplicación
- **WHEN** El desarrollador ejecuta `npm run dev`
- **THEN** Se debe abrir una ventana de Electron mostrando la interfaz base de Vue.
- **AND** La consola no debe mostrar errores de configuración de TypeScript.

### Requirement: Arquitectura Multiproceso
La aplicación debe instanciar un proceso utilitario (worker) separado del proceso principal y del renderizador para tareas intensivas.

#### Scenario: Verificación de procesos
- **WHEN** La aplicación inicia
- **THEN** Se debe identificar la existencia de un proceso principal, un proceso renderizador y un proceso utilitario (request-worker).

### Requirement: Estructura de Persistencia
El sistema debe reconocer y respetar la estructura de carpetas definida para el código fuente.

#### Scenario: Organización de código
- **WHEN** Se inspecciona el directorio `src`
- **THEN** Deben existir subdirectorios claros para `main`, `preload`, `renderer` y `shared` (tipos compartidos).
