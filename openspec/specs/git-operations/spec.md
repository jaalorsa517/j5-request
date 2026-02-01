# Git Operations

## Purpose
Proporcionar al usuario la capacidad de gestionar el control de versiones de sus peticiones directamente desde la aplicación, permitiendo un flujo de trabajo "API-as-Code" integrado.

## Requirements

### Requirement: Operaciones Básicas de Git
El sistema debe permitir ejecutar comandos fundamentales de Git sobre los repositorios detectados.

#### Scenario: Realizar un Commit
- **WHEN** El usuario selecciona archivos para "stage", escribe un mensaje y hace clic en "Commit".
- **THEN** Se debe ejecutar `git add` para los archivos seleccionados.
- **THEN** Se debe ejecutar `git commit` con el mensaje proporcionado.
- **THEN** La lista de cambios debe limpiarse y mostrarse vacía (o con los archivos restantes).

#### Scenario: Sincronizar Cambios (Pull & Push)
- **WHEN** El usuario hace clic en "Sync" (o Push/Pull individualmente).
- **THEN** Se debe intentar `git pull` primero (con estrategia de rebase o merge por defecto configuration).
- **THEN** Si es exitoso, ejecutar `git push`.
- **THEN** Si hay conflicto o error de autenticación, mostrar notificación de error clara.

### Requirement: Gestión de Ramas
Permitir visualizar la rama actual y cambiar a otra.

#### Scenario: Cambiar de Rama
- **WHEN** El usuario selecciona una rama de la lista de ramas locales disponibles.
- **THEN** Se ejecuta `git checkout <nombre-rama>`.
- **THEN** La UI se actualiza reflejando el nuevo estado de archivos y la rama activa.
