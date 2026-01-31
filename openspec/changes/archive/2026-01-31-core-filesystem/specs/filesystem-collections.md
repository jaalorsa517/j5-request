## ADDED Requirements

### Requirement: Estructura de Proyecto Basada en Directorios (RF-01)
El sistema debe tratar cualquier directorio del sistema de archivos como una colección (Workspace/Project) válida si contiene archivos de definición de petición.

#### Scenario: Carga Inicial de Directorio
- **WHEN** el usuario selecciona un directorio raíz para abrir
- **THEN** el sistema debe escanear recursivamente todas las subcarpetas
- **AND** mapear cada subcarpeta como una "Sub-colección" o grupo
- **AND** mapear cada archivo `.json` compatible como una "Petición"

### Requirement: Persistencia Granular de Peticiones (RF-01)
Cada petición HTTP se debe almacenar como un archivo individual independiente (por defecto `.json`) para facilitar la gestión de versiones.

#### Scenario: Guardado de Petición
- **WHEN** el usuario guarda una petición nueva o existente
- **THEN** se debe escribir un único archivo en el disco correspondiente a esa petición
- **AND** el nombre del archivo debe corresponder al ID o nombre de la petición (sanitizado)

### Requirement: Formato Human-Readable para Git (RNF-01)
El formato de persistencia de las peticiones debe estar optimizado para control de versiones, minimizando el ruido en los diffs.

#### Scenario: Serialización de JSON
- **WHEN** el sistema escribe el archivo de petición en disco
- **THEN** el contenido JSON debe estar indentado (pretty-print)
- **AND** las claves del objeto JSON deben estar ordenadas alfabéticamente de forma determinista

### Requirement: Modelo de Datos de Petición (RF-02)
El archivo de petición debe soportar la definición de los campos esenciales del protocolo HTTP.

#### Scenario: Estructura de Archivo
- **WHEN** se define una petición
- **THEN** el esquema debe soportar: Método, URL, Headers, Query Params, Body (varios tipos) y Auth.
