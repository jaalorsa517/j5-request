# Spec: UI Theming

## Requirements

### Requirement: Gestión de Tema (Dark/Light)
La aplicación debe permitir cambiar entre temas claro y oscuro, respetando la preferencia del sistema y persistiendo la elección del usuario.

#### Scenario: Inicialización del Tema
- **WHEN** La aplicación se inicia.
- **THEN** Verifica si existe una preferencia guardada en `localStorage`.
- **IF** No existe preferencia, **THEN** utiliza la preferencia del sistema (`prefers-color-scheme`).
- **IF** Existe preferencia, **THEN** aplica el tema guardado.

#### Scenario: Cambio de Tema
- **WHEN** El usuario invoca la acción de cambiar tema.
- **THEN** El atributo `data-theme` del documento debe actualizarse al nuevo valor ('dark' o 'light').
- **AND** La nueva selección debe guardarse en `localStorage` para futuras sesiones.

#### Scenario: Interacción de Usuario
- **WHEN** El usuario hace clic en el botón de "Cambiar Tema" ubicado en la interfaz principal.
- **THEN** La aplicación alternará entre los modos Claro y Oscuro.
- **AND** El cambio será visible inmediatamente sin recargar.

#### Scenario: Visualización Consistente
- **WHEN** Se aplica el tema Claro.
- **THEN** Elementos como pestañas (`RequestTabBar`), paneles (`RequestPanel`, `ResponsePanel`) y editores deben tener fondo claro y texto oscuro con contraste suficiente.
- **AND** Ningún texto debe ser invisible (blanco sobre blanco o negro sobre negro).
