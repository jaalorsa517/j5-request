## MODIFIED Requirements

### Requirement: Configuración de Petición
El usuario debe poder configurar los parámetros esenciales de una petición HTTP en una interfaz unificada.

#### Scenario: Barra de Dirección
- **WHEN** El usuario accede a una petición.
- **THEN** Debe ver un selector de método HTTP (GET, POST, PUT, DELETE, PATCH).
- **THEN** Debe ver un campo de texto para ingresar la URL.

#### Scenario: Secciones de Configuración
- **WHEN** El usuario necesita agregar detalles.
- **THEN** Debe poder navegar entre pestañas/secciones para: Headers, Query Params, y Body.
- **THEN** El estado de estas secciones debe persistir mientras se navega entre archivos (si se implementa store efímero).

#### Scenario: Ejecución desde la Barra de Dirección
- **WHEN** El usuario presiona `Enter` (con modificador Ctrl/Cmd según OS) en el campo de URL.
- **THEN** El sistema SHALL disparar la ejecución de la petición.
