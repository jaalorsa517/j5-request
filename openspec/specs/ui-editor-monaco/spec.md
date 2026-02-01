# Spec: Monaco Editor Integration

## Requirements

### Requirement: JSON Edition
El sistema debe proveer un editor de código avanzado basado en Monaco Editor para la edición de contenido JSON.

#### Scenario: Edición de Body
- **WHEN** El usuario edita el cuerpo de la petición.
- **THEN** El editor debe ofrecer resaltado de sintaxis JSON.
- **THEN** El editor debe validar la sintaxis JSON en tiempo real (marcar errores).
- **THEN** El editor debe permitir formateo automático.

### Requirement: Read-Only Mode
El sistema debe permitir configurar el editor en modo solo lectura para visualizar respuestas.

#### Scenario: Visualización de Respuesta
- **WHEN** Se muestra una respuesta del servidor.
- **THEN** El contenido debe ser seleccionable pero no editable.
- **THEN** El resaltado de sintaxis debe mantenerse activo.
