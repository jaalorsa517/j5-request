## ADDED Requirements

### Requirement: Procesamiento en Proceso Utilitario (Worker)
El sistema SHALL delegar el parseo y la manipulación de grandes estructuras JSON al proceso utilitario para mantener la responsividad de la interfaz.

#### Scenario: Parseo de JSON Grande
- **WHEN** Se recibe una cadena JSON que supera los 1MB.
- **THEN** El sistema SHALL enviar el contenido al worker para su procesamiento.
- **AND** El worker SHALL devolver la estructura procesada en fragmentos o mediante transferencia de buffers si es posible.

### Requirement: Transmisión por Bloques (Streaming)
El sistema SHALL soportar la transmisión de datos entre el proceso principal y el renderizador mediante flujos (streams) para evitar picos de memoria.

#### Scenario: Carga de Respuesta Voluminosa
- **WHEN** Una respuesta de API es mayor a 5MB.
- **THEN** El proceso principal SHALL transmitir los datos al renderizador en bloques manejables.
- **AND** El renderizador SHALL procesar cada bloque de forma asíncrona.
