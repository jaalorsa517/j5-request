# Spec: Interface Design Infrastructure

## Purpose
Establecer la infraestructura y directrices para que el agente Gemini CLI pueda realizar tareas de diseño de interfaces coherentes con los estándares del proyecto J5-Request.

## Requirements

### Requirement: Skill de Diseño de Interfaces (Interface Design)
La aplicación SHALL disponer de una skill especializada para el diseño de interfaces (dashboards, paneles de administración, herramientas interactivas).

#### Scenario: Uso de la Skill
- **WHEN** El usuario solicita asistencia para el diseño de una nueva interfaz o componente.
- **THEN** El agente SHALL activar la skill `interface-design`.
- **AND** El agente SHALL seguir las directrices de diseño establecidas en el archivo `SKILL.md` de dicha skill.

#### Scenario: Referencias de Diseño
- **WHEN** Se realiza un diseño utilizando la skill.
- **THEN** El agente SHALL consultar las imágenes y documentos de referencia en `references/`.
- **AND** Los diseños generados SHALL ser coherentes con el sistema de Design Tokens del proyecto.

#### Scenario: Restricción de Alcance
- **WHEN** Se solicita diseño para marketing (landing pages, campañas).
- **THEN** La skill SHALL informar que su alcance se limita exclusivamente a diseño de productos e interfaces interactivas.
