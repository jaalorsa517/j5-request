## MODIFIED Requirements

### Requirement: Open File in UI
La interacción con el sistema de archivos debe reflejarse en el editor.

#### Scenario: Selección de Archivo
- **WHEN** El usuario selecciona un archivo `.j5request` en el árbol de archivos.
- **THEN** El contenido del archivo debe cargarse en el Store de la Petición.
- **THEN** El Editor Monaco debe mostrar el contenido cargado.
- **THEN** El panel de configuración (URL, Method, Headers) debe actualizarse con los datos del archivo.

## ADDED Requirements

### Requirement: Filtrado de Archivos
El sistema solo debe mostrar y operar con archivos compatibles.

#### Scenario: Visualización en Explorador
- **WHEN** El explorador de archivos carga el contenido de un directorio.
- **THEN** Solo debe mostrar directorios y archivos con extensión `.j5request`.
- **THEN** Los archivos `.json` u otros tipos deben ser ocultados.

### Requirement: Guardar Petición
Las peticiones se deben persistir con la extensión propia de la aplicación.

#### Scenario: Guardar Nuevo Archivo
- **WHEN** El usuario crea y guarda una nueva petición.
- **THEN** El archivo se debe crear con la extensión `.j5request`.
- **THEN** El contenido debe ser formato JSON válido.
