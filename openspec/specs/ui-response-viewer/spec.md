# Spec: Response Viewer

## Requirements

### Requirement: Visualización de Estado
El usuario debe recibir retroalimentación inmediata sobre el resultado de la petición.

#### Scenario: Petición Completada
- **WHEN** La petición finaliza.
- **THEN** Se debe mostrar el Código de Estado HTTP (ej. 200 OK) con un indicador de color (Verde/2xx, Amarillo/3xx, Rojo/4xx-5xx).
- **THEN** Se debe mostrar el tiempo de respuesta (ms).
- **THEN** Se debe mostrar el tamaño de la respuesta (KB/MB).

### Requirement: Visualización de Cuerpo
El cuerpo de la respuesta debe ser legible.

#### Scenario: Respuesta JSON
- **WHEN** La respuesta es de tipo `application/json`.
- **THEN** Se debe renderizar usando el componente `ui-editor-monaco` en modo lectura.
