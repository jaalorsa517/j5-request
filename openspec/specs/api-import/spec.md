# Spec: API Import

## Purpose

Permitir a los usuarios importar requests HTTP desde formatos externos populares (cURL, OpenAPI, Postman, Insomnia, Fetch, PowerShell) al formato nativo de la aplicación, facilitando la migración desde otras herramientas y workflows.

## Requirements

### Requirement: Detección de Formato
El sistema debe identificar automáticamente el formato del contenido a importar cuando sea posible.

#### Scenario: Detección Automática Exitosa
- **WHEN** El usuario pega o selecciona contenido de importación.
- **THEN** El sistema analiza la estructura y detecta el formato (cURL, JSON de Postman, OpenAPI, etc.).
- **AND** Muestra el formato detectado al usuario.

#### Scenario: Formato Ambiguo
- **WHEN** El sistema no puede determinar el formato automáticamente.
- **THEN** Solicita al usuario que seleccione manualmente el formato desde una lista.

### Requirement: Importación desde cURL
El sistema debe poder parsear comandos cURL y convertirlos a requests nativos.

#### Scenario: cURL Válido
- **WHEN** El usuario importa un comando cURL válido (ej. `curl -X POST https://api.example.com -H "Content-Type: application/json" -d '{"key":"value"}'`).
- **THEN** El sistema extrae el método HTTP, URL, headers y body.
- **AND** Crea un archivo `.j5request` con esos valores.

#### Scenario: cURL Inválido
- **WHEN** El usuario importa un comando cURL mal formado.
- **THEN** El sistema muestra un error descriptivo indicando qué parte del comando es inválida.

### Requirement: Importación desde OpenAPI
El sistema debe poder importar especificaciones OpenAPI 3.x y generar un request por endpoint.

#### Scenario: OpenAPI Válido
- **WHEN** El usuario importa un archivo OpenAPI con múltiples paths (ej. `/users`, `/posts`).
- **THEN** El sistema genera un archivo `.j5request` por cada operación (GET /users, POST /users, etc.).
- **AND** Los archivos se nombran usando el patrón `{method}-{path}.j5request` (ej. `GET-users.j5request`).

#### Scenario: OpenAPI con baseURL
- **WHEN** La especificación OpenAPI define `servers[0].url`.
- **THEN** Los requests generados usan esa URL base como prefijo.

### Requirement: Importación desde Postman/Insomnia
El sistema debe poder importar colecciones exportadas desde Postman v2.1 e Insomnia.

#### Scenario: Colección de Postman
- **WHEN** El usuario importa un archivo JSON de colección Postman.
- **THEN** El sistema recorre cada request en la colección.
- **AND** Genera un archivo `.j5request` por request, preservando nombre, método, URL, headers y body.

### Requirement: Importación desde Fetch/PowerShell
El sistema debe parsear snippets de código JavaScript (fetch) y PowerShell (Invoke-WebRequest).

#### Scenario: Fetch JavaScript
- **WHEN** El usuario importa código fetch como `fetch('https://api.com', {method: 'POST', headers: {...}, body: ...})`.
- **THEN** El sistema extrae la URL, método, headers y body desde el objeto de configuración.

### Requirement: Fuentes de Importación
El sistema debe soportar importar desde portapapeles y archivos.

#### Scenario: Importar desde Portapapeles
- **WHEN** El usuario pega contenido en el diálogo de importación.
- **THEN** El sistema procesa el texto pegado como entrada para la conversión.

#### Scenario: Importar desde Archivo
- **WHEN** El usuario selecciona un archivo (ej. `.json`, `.yaml`, `.sh`).
- **THEN** El sistema lee el contenido del archivo y lo procesa para la conversión.

### Requirement: Manejo de Errores
El sistema debe comunicar claramente cuando una importación falla.

#### Scenario: Formato No Soportado
- **WHEN** El usuario intenta importar un formato no reconocido.
- **THEN** El sistema muestra un mensaje indicando los formatos soportados.

#### Scenario: Archivo Corrupto
- **WHEN** El archivo seleccionado está vacío o corrupto.
- **THEN** El sistema muestra un error indicando que el archivo no pudo ser leído.
