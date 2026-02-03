## ADDED Requirements

### Requirement: Ejecución HTTP desde Main Process
El sistema debe ejecutar peticiones HTTP desde el proceso principal de Electron protegidas contra errores de red y CORS.

#### Scenario: Realizar Petición GET Simple
- **WHEN** El usuario envía una petición GET a una URL pública.
- **THEN** El sistema ejecuta la petición sin validar reglas CORS del navegador.
- **THEN** El sistema retorna código de estado, cabeceras y cuerpo de la respuesta.

#### Scenario: Manejo de Errores de Red
- **WHEN** La URL es inaccesible o DNS falla.
- **THEN** El sistema retorna una estructura de error controlada con mensaje descriptivo, no una excepción no capturada.

#### Scenario: Soporte de Métodos Rest
- **WHEN** Se configura una petición con métodos POST, PUT, PATCH, DELETE.
- **THEN** El sistema respeta el método y envía el cuerpo (body) correspondiente si aplica.

### Requirement: Soporte de Body Types
El sistema debe soportar diferentes tipos de cuerpo en la petición.

#### Scenario: Envío de JSON
- **WHEN** El usuario selecciona tipo `raw/json`.
- **THEN** El header `Content-Type` se ajusta a `application/json` automáticamente si no existe.
- **THEN** El cuerpo se envía como string JSON válido.
