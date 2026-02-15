# Spec: UI Theming (Delta)

## MODIFIED Requirements

### Requirement: Gestión de Tema (Dark/Light)
El sistema debe mantener la consistencia del tema seleccionado en todas las capas de la interfaz, incluyendo diálogos modales y overlays.

#### Scenario: Visualización de Modales
- **WHEN** Se muestra un diálogo modal (ej. "New Request", "Environment Manager").
- **THEN** El fondo del diálogo debe tener el color correspondiente al tema actual (oscuro o claro).
- **AND** El texto dentro del diálogo debe ser legible con contraste adecuado.
- **AND** Los campos de entrada (inputs) deben respetar el tema en curso.
