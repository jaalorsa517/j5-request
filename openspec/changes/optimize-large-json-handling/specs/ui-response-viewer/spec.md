## MODIFIED Requirements

### Requirement: Visualización de Cuerpo
El cuerpo de la respuesta debe ser legible, manteniendo el rendimiento incluso con datos voluminosos.

#### Scenario: Respuesta JSON
- **WHEN** La respuesta es de tipo `application/json`.
- **THEN** Se debe renderizar usando el componente `ui-editor-monaco` en modo lectura.

#### Scenario: Respuesta JSON Grande
- **WHEN** El cuerpo de la respuesta supera los 2MB.
- **THEN** El sistema SHALL activar el modo de visualización optimizada.
- **AND** El sistema SHALL truncar o virtualizar la carga inicial si es necesario para mantener la fluidez de la UI.
- **AND** Se SHALL mostrar una advertencia al usuario si la visualización completa puede impactar el rendimiento.
