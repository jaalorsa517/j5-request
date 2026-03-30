## MODIFIED Requirements

### Requirement: Importación desde Postman/Insomnia
El sistema debe poder importar colecciones exportadas desde Postman v2.1 e Insomnia, optimizando el procesamiento para colecciones grandes.

#### Scenario: Colección de Postman
- **WHEN** El usuario importa un archivo JSON de colección Postman.
- **THEN** El sistema recorre cada request en la colección.
- **AND** Genera un archivo `.j5request` por request, preservando nombre, método, URL, headers y body.

#### Scenario: Colección Masiva
- **WHEN** La colección contiene más de 100 peticiones.
- **THEN** El sistema SHALL procesar la importación de forma asíncrona mediante el worker.
- **AND** El sistema SHALL mostrar un indicador de progreso al usuario.

### Requirement: Fuentes de Importación
El sistema debe soportar importar desde portapapeles y archivos, manejando eficientemente archivos de gran tamaño.

#### Scenario: Importar desde Portapapeles
- **WHEN** El usuario pega contenido en el diálogo de importación.
- **THEN** El sistema procesa el texto pegado como entrada para la conversión.

#### Scenario: Importar desde Archivo
- **WHEN** El usuario selecciona un archivo (ej. `.json`, `.yaml`, `.sh`).
- **THEN** El sistema lee el contenido del archivo y lo procesa para la conversión.
- **AND** SI el archivo supera los 2MB, el sistema SHALL utilizar una estrategia de lectura por bloques para evitar saturar la memoria.
