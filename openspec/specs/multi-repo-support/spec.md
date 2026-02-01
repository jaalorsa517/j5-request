# Multi-Repo Support

## Purpose
Permitir trabajar con espacios de trabajo que contienen múltiples repositorios Git independientes, facilitando la gestión de microservicios o colecciones modulares.

## Requirements

### Requirement: Detección Múltiple
El sistema debe ser capaz de manejar workspace que contengan múltiples raíces de git o sub-proyectos.

#### Scenario: Escaneo de Workspace
- **WHEN** Se carga un workspace con carpetas `A` y `B`, ambas siendo repositorios git.
- **THEN** El panel de git debe listar ambos repositorios por separado.
- **THEN** Las acciones de commit/push/pull deben ser contextuales al repositorio donde ocurrió el cambio o donde el usuario está interactuando.
