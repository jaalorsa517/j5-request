## MODIFIED Requirements

### Requirement: JSON Edition
El sistema debe proveer un editor de código avanzado basado en Monaco Editor para la edición de contenido JSON.

#### Scenario: Edición de Body
- **WHEN** El usuario edita el cuerpo de la petición.
- **THEN** El editor debe ofrecer resaltado de sintaxis JSON.
- **THEN** El editor debe validar la sintaxis JSON en tiempo real (marcar errores).
- **THEN** El editor debe permitir formateo automático.

#### Scenario: Atajo de Ejecución en Editor
- **WHEN** El usuario presiona `Ctrl + Enter` (o Cmd + Enter en Mac) mientras el foco está en el editor de cuerpo.
- **THEN** El sistema SHALL interceptar el evento y disparar la ejecución de la petición.
- **AND** El editor SHALL NO insertar un salto de línea en ese caso específico.
