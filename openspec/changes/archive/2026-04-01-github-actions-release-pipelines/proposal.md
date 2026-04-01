## Why

Actualmente, el proceso de construcción y liberación de versiones de la aplicación es manual, lo que es propenso a errores, consume tiempo y dificulta la distribución de binarios para múltiples sistemas operativos. Existe la necesidad de automatizar este flujo para generar instaladores coherentes y disponibilizar releases de manera profesional en GitHub, facilitando así el sistema de auto-actualización.

## What Changes

- **Automatización de CI/CD**: Implementación de workflows de GitHub Actions para compilación, prueba y despliegue automático.
- **Soporte Multi-plataforma**: Generación de binarios para Windows (NSIS), macOS (DMG) y Linux (AppImage, DEB, RPM, Pacman).
- **Publicación Automática**: Configuración de `electron-builder` para publicar artefactos directamente en GitHub Releases tras la creación de un tag de versión.
- **Validación de Calidad**: Integración de linting y pruebas unitarias en la pipeline antes del proceso de construcción.

## Capabilities

### New Capabilities
- `continuous-deployment-infrastructure`: Infraestructura de despliegue continuo para aplicaciones Electron multi-plataforma.
- `multi-distro-linux-packaging`: Capacidad de generar paquetes nativos para las principales familias de distribuciones Linux (Debian, Fedora, Arch).

### Modified Capabilities
- `auto-update-infrastructure`: Se vincula con la pipeline para recibir los metadatos de actualización (`latest.yml`).
- `core-foundation`: Actualización de la configuración de publicación en los archivos de proyecto.

## Impact

- `.github/workflows/release.yml`: Nuevo archivo de workflow.
- `electron-builder.json5`: Actualización de la sección `publish` y targets de Linux.
- `package.json`: Posibles scripts adicionales para gestión de versiones.
