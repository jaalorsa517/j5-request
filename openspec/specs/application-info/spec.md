# Requirement: Diálogo de Información de Aplicación
El sistema SHALL proporcionar un diálogo modal que muestre la información esencial del proyecto e incluya opciones de soporte y financiamiento.

## Scenario: Visualización de información básica
- **WHEN** El usuario activa la acción "Acerca de".
- **THEN** Se SHALL mostrar un modal con el nombre de la aplicación, versión, autor y descripción del proyecto.
- **AND** Se SHALL mostrar un botón para realizar donaciones.
- **AND** Se SHALL mostrar un botón para reportar errores o problemas.

## Scenario: Cierre del diálogo
- **WHEN** El usuario hace clic en el botón "Cerrar" o presiona la tecla `Esc`.
- **THEN** El diálogo modal de información SHALL cerrarse y devolver el foco a la ventana principal.
