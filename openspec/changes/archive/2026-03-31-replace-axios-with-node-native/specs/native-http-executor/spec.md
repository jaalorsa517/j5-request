## ADDED Requirements

### Requirement: Ejecutor HTTP Nativo
El sistema SHALL ejecutar peticiones HTTP utilizando exclusivamente módulos integrados de Node.js.

#### Scenario: Ejecución exitosa de petición GET
- **WHEN** El usuario envía una petición GET a una URL válida.
- **THEN** El sistema SHALL utilizar el módulo `https` (o `http`) nativo para realizar la conexión.
- **AND** El sistema SHALL devolver el código de estado, cabeceras y el cuerpo de la respuesta procesado correctamente.

#### Scenario: Envío de cuerpo de petición (POST/PUT)
- **WHEN** Se envía una petición con cuerpo (JSON).
- **THEN** El sistema SHALL establecer automáticamente la cabecera `Content-Length`.
- **AND** El sistema SHALL escribir el cuerpo en el stream de la petición antes de finalizarla.

#### Scenario: Configuración de Certificados SSL
- **WHEN** Se proporcionan certificados personalizados en la configuración del proyecto.
- **THEN** El sistema SHALL inyectar las opciones `ca`, `cert`, `key` y `pfx` en el agente de la petición nativa.
