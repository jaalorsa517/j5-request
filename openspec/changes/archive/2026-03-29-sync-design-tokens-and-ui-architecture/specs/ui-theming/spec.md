## ADDED Requirements

### Requirement: Sistema de Design Tokens
El sistema de tematización SHALL basarse en un conjunto de design tokens (variables CSS) organizados por semántica de uso (superficies, tipografía, bordes).

#### Scenario: Uso de Tokens de Superficie
- **WHEN** El desarrollador define el fondo de un componente principal (ej. el contenedor de la aplicación).
- **THEN** SHALL utilizar la variable `--bg-primary` (mapeada a `--ink`).
- **AND** El fondo de paneles secundarios SHALL utilizar `--bg-secondary` (mapeada a `--coal`).

#### Scenario: Tipografía Basada en Tokens
- **WHEN** Se muestra texto en la interfaz.
- **THEN** El color del texto principal SHALL ser `--text-primary` (mapeada a `--parchment`).
- **AND** El texto secundario SHALL utilizar `--text-secondary` (mapeada a `--cloud`).

#### Scenario: Identidad de Marca (Branding)
- **WHEN** Se requieren elementos con el color de marca (ej. botones de acción principal).
- **THEN** SHALL utilizar la variable `--brand-primary` con el valor hexadecimal `#008937`.
- **AND** Se SHALL disponer de variantes `--brand-secondary` y `--brand-tertiary` para estados de interacción.

## MODIFIED Requirements

### Requirement: Gestión de Tema (Dark/Light)
La aplicación debe permitir cambiar entre temas claro y oscuro, respetando la preferencia del sistema y persistiendo la elección del usuario mediante la actualización de los design tokens correspondientes.

#### Scenario: Inicialización del Tema
- **WHEN** La aplicación se inicia.
- **THEN** Verifica si existe una preferencia guardada en `localStorage`.
- **IF** No existe preferencia, **THEN** utiliza la preferencia del sistema (`prefers-color-scheme`).
- **IF** Existe preferencia, **THEN** aplica el tema guardado.

#### Scenario: Cambio de Tema
- **WHEN** El usuario invoca la acción de cambiar tema.
- **THEN** El atributo `data-theme` del documento debe actualizarse al nuevo valor ('dark' o 'light').
- **AND** El sistema SHALL reasignar los valores de los design tokens (variables CSS) según el tema seleccionado.
- **AND** La nueva selección debe guardarse en `localStorage` para futuras sesiones.
