# Spec: Core Foundation

## Requirements

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

### Requirement: Definición de Tipos
El código debe seguir convenciones estrictas de TypeScript para la definición de estructuras de datos.

#### Scenario: Uso de Type vs Interface
- **WHEN** Se define la forma de un objeto o estructura de datos.
- **THEN** Se debe utilizar `type` y no `interface`.
- **AND** `interface` se reserva exclusivamente para definir contratos de clases o implementación de métodos (similar a Java/C#).

### Requirement: Definición de Identidad Visual
El sistema SHALL establecer una base de activos visuales y colores de marca que unifiquen la identidad de la aplicación.

#### Scenario: Uso de Iconos de Aplicación
- **WHEN** Se construye el instalador (vía `electron-builder`).
- **THEN** Se SHALL utilizar los iconos definidos en `public/icon.png` y `public/icon.svg`.
- **AND** Los archivos en la carpeta `build/` SHALL estar sincronizados con la identidad visual actual.

#### Scenario: Configuración de Branding Primario
- **WHEN** Se define el esquema de colores básico.
- **THEN** El color hexadecimal `#008937` SHALL ser el identificador primario de J5-Request.
- **AND** El sistema SHALL reflejar este color en los metadatos de la aplicación si es soportado por el sistema operativo.

### Requirement: Infraestructura de Agente - Skills
El sistema SHALL soportar la extensión de las capacidades del agente Gemini mediante el uso de skills locales configuradas en el directorio `.agent/skills/`.

#### Scenario: Disponibilidad de Skill de Diseño
- **WHEN** El agente es invocado para tareas de diseño.
- **THEN** SHALL tener acceso a las directrices de `interface-design` mediante su documentación local.
- **AND** SHALL respetar las referencias de diseño guardadas en la subcarpeta `references/` de la skill.
