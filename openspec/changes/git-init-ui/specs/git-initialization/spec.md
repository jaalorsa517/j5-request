# Spec: Git Initialization

## Purpose

Permitir al usuario inicializar un repositorio Git desde la interfaz de la aplicación cuando la carpeta abierta no tiene control de versiones configurado.

## Requirements

### Requirement: Detección de Repositorio Git
El sistema debe detectar si la carpeta actual tiene un repositorio Git inicializado.

#### Scenario: Carpeta sin Git
- **WHEN** El usuario abre una carpeta que no contiene un repositorio Git (no existe `.git/`).
- **THEN** El panel de Git debe mostrar un mensaje indicando que no hay repositorio.
- **AND** Debe ofrecer una opción visible para inicializar Git en esa carpeta.

#### Scenario: Carpeta con Git
- **WHEN** El usuario abre una carpeta que ya tiene un repositorio Git.
- **THEN** El panel de Git debe mostrar el estado normal (archivos modificados, ramas, etc.).

### Requirement: Inicialización de Repositorio
El usuario debe poder inicializar un repositorio Git directamente desde la interfaz.

#### Scenario: Inicializar Git Exitosamente
- **WHEN** El usuario hace clic en el botón "Inicializar Git" en el panel de Git.
- **THEN** El sistema ejecuta `git init` en la carpeta actual.
- **AND** Al completarse exitosamente, el panel de Git actualiza su vista para mostrar el estado del nuevo repositorio (usualmente sin commits).
- **AND** El botón de inicialización desaparece.

#### Scenario: Error al Inicializar
- **WHEN** El usuario intenta inicializar Git pero la operación falla (ej. permisos insuficientes).
- **THEN** El sistema muestra un mensaje de error claro indicando la causa.
- **AND** El panel de Git permanece en el estado "sin repositorio".
