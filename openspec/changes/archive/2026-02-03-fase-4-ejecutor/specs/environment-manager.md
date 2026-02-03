## ADDED Requirements

### Requirement: Resolución de Variables
El sistema debe reemplazar los placeholders `{{variable}}` en la URL, Headers y Body antes de enviar la petición.

#### Scenario: Reemplazo Simple
- **WHEN** La URL es `{{baseUrl}}/users` y `baseUrl` es `https://api.example.com`.
- **THEN** La petición se envía a `https://api.example.com/users`.

#### Scenario: Variables no definidas
- **WHEN** Se usa `{{var_inexistente}}` y no está definida.
- **THEN** Se mantiene el texto literal `{{var_inexistente}}` o se reemplaza por string vacío (según diseño, postman lo deja literal). **Decisión:** Dejar literal para visibilidad del error.

### Requirement: Ámbitos de Variables (Scopes)
El sistema debe soportar variables Globales y de Entorno, con precedencia.

#### Scenario: Precedencia de Entorno
- **WHEN** Existe `token` en Globales y `token` en Entorno activo.
- **THEN** Se usa el valor del Entorno activo.

### Requirement: Persistencia de Secretos
Las variables marcadas como secretas o sensibles no deben commitearse.

#### Scenario: Archivo de Entorno Local
- **WHEN** Se guardan variables de un entorno.
- **THEN** Se debe prever mecanismos para no incluir secretos en el JSON compartido si fuera el caso (aunque para esta fase inicial, se asume almacenamiento en archivos `.json` que el usuario gestiona; *Nota de Requisito RF-10/Environment*: El RF-10 menciona .env.local).
