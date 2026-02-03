## ADDED Requirements

### Requirement: Pruebas de RequestExecutor
El sistema DEBE verificar que `RequestExecutor` procesa correctamente las solicitudes HTTP básicas y maneja los errores.

#### Scenario: Ejecución de solicitud GET simple
- **WHEN** se invoca `executeRequest` con una configuración de método GET y URL válida
- **THEN** debe retornar `success: true` y los datos de la respuesta simulada

#### Scenario: Manejo de errores de red
- **WHEN** la solicitud falla por error de red (simulado)
- **THEN** debe retornar `success: false` y el mensaje de error correspondiente

### Requirement: Pruebas de EnvironmentManager
El sistema DEBE verificar que `EnvironmentManager` resuelve correctamente las variables de entorno en cadenas de texto.

#### Scenario: Resolución de variable simple
- **WHEN** se proporciona una cadena `{{host}}` y un entorno `{ "host": "localhost" }`
- **THEN** debe retornar la cadena `"localhost"`

#### Scenario: Resolución de múltiples variables
- **WHEN** se proporciona una cadena `{{protocol}}://{{host}}:{{port}}` con el entorno adecuado
- **THEN** debe retornar la URL completa sustituida correctamente

#### Scenario: Variable no encontrada
- **WHEN** se solicita una variable que no existe en el entorno
- **THEN** debe dejar el marcador `{{variable}}` intacto o resolver a vacío (según comportamiento actual)
