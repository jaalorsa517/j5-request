# Spec: UI Theming

## Requirements

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

#### Scenario: Interacción de Usuario
- **WHEN** El usuario hace clic en el botón de "Cambiar Tema" ubicado en la interfaz principal.
- **THEN** La aplicación alternará entre los modos Claro y Oscuro.
- **AND** El cambio será visible inmediatamente sin recargar.

#### Scenario: Visualización Consistente
- **WHEN** Se aplica el tema Claro.
- **THEN** Elementos como pestañas (`RequestTabBar`), paneles (`RequestPanel`, `ResponsePanel`) y editores deben tener fondo claro y texto oscuro con contraste suficiente.
- **AND** Ningún texto debe ser invisible (blanco sobre blanco o negro sobre negro).

#### Scenario: Visualización de Modales
- **WHEN** Se muestra un diálogo modal (ej. "New Request", "Environment Manager").
- **THEN** El fondo del diálogo debe tener el color correspondiente al tema actual (oscuro o claro).
- **AND** El texto dentro del diálogo debe ser legible con contraste adecuado.
- **AND** Los campos de entrada (inputs) deben respetar el tema en curso.
