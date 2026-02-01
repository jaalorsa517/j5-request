# Spec: Request Composer Layout

## Requirements

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

### Requirement: Parameters Management
Gestión visual de parámetros clave-valor (Query Params, Headers).

#### Scenario: Agregar Header
- **WHEN** El usuario agrega un header.
- **THEN** Debe poder ingresar "Key" y "Value" en campos separados.
- **THEN** Debe poder activar/desactivar el header sin borrarlo.
