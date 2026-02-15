# Spec: UI Theming (Delta)

## MODIFIED Requirements

### Requirement: Gestión de Tema (Dark/Light)
El usuario debe tener control explícito sobre la preferencia de tema visual de la aplicación.

#### Scenario: Interacción de Usuario
- **WHEN** El usuario hace clic en el botón de "Cambiar Tema" ubicado en la interfaz principal.
- **THEN** La aplicación alternará entre los modos Claro y Oscuro.
- **AND** El cambio será visible inmediatamente sin recargar.

#### Scenario: Visualización Consistente
- **WHEN** Se aplica el tema Claro.
- **THEN** Elementos como pestañas (`RequestTabBar`), paneles (`RequestPanel`, `ResponsePanel`) y editores deben tener fondo claro y texto oscuro con contraste suficiente.
- **AND** Ningún texto debe ser invisible (blanco sobre blanco o negro sobre negro).
