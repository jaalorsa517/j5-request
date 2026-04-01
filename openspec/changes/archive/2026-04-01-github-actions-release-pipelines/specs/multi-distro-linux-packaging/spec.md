## ADDED Requirements

### Requirement: Generación de Paquetes para Linux
El sistema SHALL generar múltiples formatos de paquetes para cubrir las principales familias de distribuciones de Linux.

#### Scenario: Sabores de Linux soportados
- **WHEN** Se compila la aplicación para Linux.
- **THEN** Se SHALL generar un archivo `.AppImage` (Universal).
- **AND** Se SHALL generar un archivo `.deb` (Debian/Ubuntu).
- **AND** Se SHALL generar un archivo `.rpm` (Fedora/RedHat).
- **AND** Se SHALL generar un archivo `.pacman` (Arch Linux).

#### Scenario: Consistencia de Nombres
- **WHEN** Se generan los artefactos de Linux.
- **THEN** El nombre del archivo SHALL seguir el patrón: `${productName}-Linux-${version}.${extension}`.
