## ADDED Requirements

### Requirement: Gestión de Directorios (Colecciones)
El sistema debe permitir la creación de nuevos directorios para organizar las peticiones en colecciones.

#### Scenario: Crear nueva colección
- **WHEN** el usuario solicita crear un directorio en una ruta válida
- **THEN** el directorio debe crearse físicamente en el disco.
- **THEN** si el directorio padre no existe, debe crearse recursivamente (opcional, pero buena práctica).
- **THEN** si el directorio ya existe, el sistema debe retornar un error o manejarlo adecuadamente.

### Requirement: Renombrado de Elementos
El sistema debe permitir cambiar el nombre de cualquier archivo (.json) o directorio gestionado.

#### Scenario: Renombrar archivo existente
- **WHEN** el usuario renombra un archivo de "request-a.json" a "request-b.json"
- **THEN** el archivo original debe dejar de existir.
- **THEN** el contenido debe preservarse en el nuevo archivo.

#### Scenario: Renombrar directorio
- **WHEN** el usuario renombra un directorio
- **THEN** todos los archivos y subdirectorios contenidos deben moverse a la nueva ruta.

### Requirement: Eliminación de Elementos
El sistema debe permitir eliminar archivos y directorios de forma definitiva.

#### Scenario: Eliminar archivo
- **WHEN** el usuario elimina un archivo de petición
- **THEN** el archivo debe ser borrado del disco.

#### Scenario: Eliminar directorio no vacío
- **WHEN** el usuario elimina un directorio que contiene archivos
- **THEN** el directorio y todo su contenido deben ser eliminados (borrado recursivo).
