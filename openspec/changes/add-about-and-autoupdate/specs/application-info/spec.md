## ADDED Requirements

### Requirement: Diálogo de Información de Aplicación
El sistema SHALL proporcionar un diálogo modal que muestre la información esencial del proyecto.

#### Scenario: Visualización de información básica
- **WHEN** El usuario selecciona la opción "Acerca de" en el menú de la aplicación.
- **THEN** Se debe mostrar un diálogo modal.
- **AND** El diálogo SHALL mostrar el nombre del proyecto ("J5-Request").
- **AND** El diálogo SHALL mostrar la versión actual (extraída de `package.json`).
- **AND** El diálogo SHALL mostrar el autor ("jaalorsa").
- **AND** El diálogo SHALL mostrar la descripción del proyecto.

#### Scenario: Cierre del diálogo
- **WHEN** El usuario hace clic en el botón "Cerrar" o presiona la tecla `Esc`.
- **THEN** El diálogo modal de información SHALL cerrarse y devolver el foco a la ventana principal.
