## ADDED Requirements

### Requirement: Acceso a Reporte de Errores
El sistema SHALL proporcionar un acceso directo para que el usuario pueda reportar problemas en el repositorio oficial.

#### Scenario: Apertura de sistema de tickets externo
- **WHEN** El usuario hace clic en el botón "Reportar un problema" en el modal "Acerca de".
- **THEN** El sistema SHALL abrir el navegador predeterminado en la URL de creación de issues de GitHub del proyecto.
- **AND** El cuerpo del issue SHALL incluir automáticamente la versión actual de la aplicación para facilitar el diagnóstico.
