## MODIFIED Requirements

### Requirement: JSON Edition
El sistema debe proveer un editor de código avanzado basado en Monaco Editor para la edición de contenido JSON, ajustando su configuración según el tamaño del archivo.

#### Scenario: Edición de Body
- **WHEN** El usuario edita el cuerpo de la petición.
- **THEN** El editor debe ofrecer resaltado de sintaxis JSON.
- **THEN** El editor debe validar la sintaxis JSON en tiempo real (marcar errores).
- **THEN** El editor debe permitir formateo automático.

#### Scenario: Rendimiento en Archivos Grandes
- **WHEN** El contenido cargado en el editor supera los 500KB.
- **THEN** El sistema SHALL desactivar la validación sintáctica en tiempo real para preservar la fluidez.
- **AND** Se SHALL habilitar el "fast rendering" de Monaco.
