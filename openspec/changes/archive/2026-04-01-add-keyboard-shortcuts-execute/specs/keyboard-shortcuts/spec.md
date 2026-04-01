## ADDED Requirements

### Requirement: Ejecución mediante Atajo de Teclado
El sistema MUST permitir el disparo de la ejecución de la petición activa mediante una combinación de teclas.

#### Scenario: Ejecución en Windows/Linux
- **WHEN** El usuario presiona `Ctrl + Enter` teniendo el foco en el área de trabajo de la petición.
- **THEN** El sistema SHALL invocar el proceso de ejecución de la petición.

#### Scenario: Ejecución en macOS
- **WHEN** El usuario presiona `Cmd + Enter` teniendo el foco en el área de trabajo de la petición.
- **THEN** El sistema SHALL invocar el proceso de ejecución de la petición.
