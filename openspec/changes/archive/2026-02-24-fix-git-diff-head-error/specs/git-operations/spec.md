## MODIFIED Requirements

### Requirement: Lectura de Contenidos y Diferencias

El sistema debe permitir leer el contenido de archivos desde el historial de git (generalmente `HEAD`) para nutrir el visualizador de diferencias.

#### Scenario: Repositorio Sin Commits (HEAD no existe)

- **WHEN** El usuario intenta revisar las diferencias de nuevos archivos indexados en un repositorio sin un commit base inicial (`git init` reciente).
- **THEN** El comando git interno arroja un error con mensaje de objeto "HEAD" no válido.
- **AND** El sistema intercepta explícitamente el mensaje de error de un HEAD inválido.
- **AND** Retorna un contenido en blanco (`""`) previniendo crasheos de IPC y permitiendo a la UI mostrar el archivo completo como añadido (added).
