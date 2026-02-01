# Spec: Filesystem UI Integration

## ADDED Requirements

### Requirement: Open File in UI
La interacción con el sistema de archivos debe reflejarse en el editor.

#### Scenario: Selección de Archivo
- **WHEN** El usuario selecciona un archivo `.json` en el árbol de archivos.
- **THEN** El contenido del archivo debe cargarse en el Store de la Petición.
- **THEN** El Editor Monaco debe mostrar el contenido cargado.
- **THEN** El panel de configuración (URL, Method, Headers) debe actualizarse con los datos del archivo.
