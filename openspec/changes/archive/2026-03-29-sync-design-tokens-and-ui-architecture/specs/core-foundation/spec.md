## ADDED Requirements

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
