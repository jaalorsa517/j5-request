## ADDED Requirements

### Requirement: Entorno Seguro de Ejecución (Sandbox)
El sistema debe proveer un entorno aislado para ejecutar código JavaScript de usuario sin acceso a módulos sensibles de Node.js.

#### Scenario: Bloqueo de require
- **WHEN** Un script intenta usar `require('fs')` o `require('child_process')`.
- **THEN** La ejecución lanza un error indicando que `require` no está definido o permitido.

#### Scenario: Timeout de Ejecución
- **WHEN** Un script entra en un bucle infinito o tarda más de 500ms.
- **THEN** El sistema termina forzosamente la ejecución del script para no congelar la app.

### Requirement: API de Scripting (Objeto pm)
El sandbox debe exponer un objeto `pm` para interactuar con la petición y el entorno.

#### Scenario: Lectura de Variables
- **WHEN** El script ejecuta `pm.environment.get('mi_var')`.
- **THEN** Retorna el valor actual de la variable de entorno correspondiente.

#### Scenario: Escritura de Variables
- **WHEN** El script ejecuta `pm.environment.set('mi_var', 'valor')`.
- **THEN** La variable se actualiza en el contexto de memoria (y se persiste tras la ejecución exitosa).

#### Scenario: Acceso a Respuesta (Solo en Post-Script)
- **WHEN** Se ejecuta un script "Post-response".
- **THEN** El objeto `pm.response` está disponible con acceso al status, headers y body (como JSON o texto).
