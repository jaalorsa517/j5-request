## ADDED Requirements

### Requirement: Panel de Control de Código
Un panel lateral dedicado a las operaciones de control de versiones.

#### Scenario: Visualización de Estado
- **WHEN** Se abre el panel de Git.
- **THEN** Debe mostrar la lista de repositorios encontrados.
- **THEN** Para cada repositorio, mostrar la rama actual.
- **THEN** Mostrar lista de 'Changes' (modificados, borrados, nuevos) y 'Staged Changes'.

### Requirement: Visualización de Diferencias (Diff)
Visualizar qué ha cambiado en un archivo antes de confirmarlo.

#### Scenario: Abrir Diff
- **WHEN** El usuario hace clic en un archivo listado en "Changes".
- **THEN** Se abre una pestaña en el área principal con el editor Monaco en modo Diff.
- **THEN** A la izquierda se muestra la versión original (HEAD) y a la derecha la versión actual en disco.
