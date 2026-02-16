# Spec: API Export

## Purpose

Permitir a los usuarios exportar requests HTTP desde el formato nativo de la aplicación hacia formatos externos estándar (cURL, OpenAPI, Postman, Insomnia, Fetch, PowerShell), facilitando la compartición, documentación y migración a otras herramientas.

## Requirements

### Requirement: Exportación a cURL
El sistema debe poder generar un comando cURL ejecutable desde un request nativo.

#### Scenario: Exportar Request Simple
- **WHEN** El usuario exporta un request GET con headers a formato cURL.
- **THEN** El sistema genera un comando `curl -X GET <url> -H "Header: Value"` sintácticamente correcto.
- **AND** El comando se copia al portapapeles o se guarda en archivo según la elección del usuario.

#### Scenario: Exportar Request con Body
- **WHEN** El usuario exporta un POST request con body JSON.
- **THEN** El comando generado incluye `-d '{"key":"value"}'` con escaping correcto.

### Requirement: Exportación a JavaScript Fetch
El sistema debe generar código JavaScript válido usando la API Fetch.

#### Scenario: Exportar como Fetch
- **WHEN** El usuario exporta un request a formato Fetch.
- **THEN** El sistema genera código JavaScript con `fetch(url, {method, headers, body})` listo para copiar.

### Requirement: Exportación a PowerShell
El sistema debe generar código PowerShell usando Invoke-WebRequest.

#### Scenario: Exportar como PowerShell
- **WHEN** El usuario exporta un request a formato PowerShell.
- **THEN** El sistema genera código PowerShell con `Invoke-WebRequest -Uri ... -Method ... -Headers ...` sintácticamente válido.

### Requirement: Exportación a Postman Collection
El sistema debe generar un archivo JSON importable en Postman v2.1.

#### Scenario: Exportar Request Individual
- **WHEN** El usuario exporta un request individual a Postman.
- **THEN** El sistema crea una colección Postman con ese request como único ítem.

#### Scenario: Exportar Múltiples Requests
- **WHEN** El usuario selecciona múltiples archivos `.j5request` y exporta a Postman.
- **THEN** El sistema crea una colección Postman conteniendo todos los requests seleccionados.

### Requirement: Exportación a Insomnia Collection
El sistema debe generar un archivo JSON importable en Insomnia.

#### Scenario: Exportar a Insomnia
- **WHEN** El usuario exporta uno o varios requests a formato Insomnia.
- **THEN** El sistema genera un archivo JSON con la estructura de colección de Insomnia.

### Requirement: Exportación a OpenAPI
El sistema debe generar una especificación OpenAPI 3.x desde uno o más requests.

#### Scenario: Exportar Request Individual como OpenAPI
- **WHEN** El usuario exporta un request individual a OpenAPI.
- **THEN** El sistema genera un spec OpenAPI con un único path/operación.

#### Scenario: Exportar Múltiples Requests como OpenAPI
- **WHEN** El usuario exporta múltiples requests a OpenAPI.
- **THEN** El sistema genera un spec OpenAPI consolidado con múltiples paths, uno por request.

#### Scenario: Metadata de OpenAPI
- **WHEN** El usuario exporta a OpenAPI.
- **THEN** El sistema solicita metadata básica (título, versión, server URL) antes de generar el spec.

### Requirement: Destinos de Exportación
El sistema debe soportar exportar al portapapeles o a archivos.

#### Scenario: Copiar al Portapapeles
- **WHEN** El usuario selecciona "Copiar como cURL" (o cualquier formato).
- **THEN** El contenido exportado se copia al portapapeles del sistema.
- **AND** Se muestra una confirmación visual (toast/mensaje).

#### Scenario: Guardar como Archivo
- **WHEN** El usuario selecciona "Exportar a archivo".
- **THEN** Se abre un diálogo de guardado permitiendo elegir el formato y ubicación.
- **AND** El archivo se guarda con la extensión apropiada (.sh, .json, .yaml).

### Requirement: Validación de Output
El sistema debe generar código/configuración sintácticamente válido.

#### Scenario: Código cURL Ejecutable
- **WHEN** Se exporta a cURL.
- **THEN** El comando generado debe ser ejecutable en un shell estándar sin errores de sintaxis.

#### Scenario: JSON Válido
- **WHEN** Se exporta a Postman, Insomnia u OpenAPI.
- **THEN** El JSON/YAML generado debe ser válido y parseable.

### Requirement: Manejo de Limitaciones
El sistema debe comunicar cuando hay características no exportables.

#### Scenario: Scripts No Soportados
- **WHEN** Un request tiene scripts pre/post-request y se exporta a cURL.
- **THEN** El sistema muestra un warning indicando que los scripts no se incluirán en la exportación.
