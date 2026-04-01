## Context

La aplicación es un cliente HTTP desarrollado con Electron, Vue 3 y TypeScript. Actualmente, no existe automatización para el despliegue de nuevas versiones. El proyecto utiliza `pnpm` como gestor de paquetes y `electron-builder` para la construcción de instaladores.

## Goals / Non-Goals

**Goals:**
- Automatizar la construcción de binarios para Windows, macOS y Linux mediante GitHub Actions.
- Soportar las principales distribuciones de Linux (Debian, Fedora, Arch) además del formato universal AppImage.
- Configurar la publicación automática en GitHub Releases para alimentar el sistema de auto-actualización.
- Ejecutar pruebas automatizadas en cada proceso de release.

**Non-Goals:**
- Implementar firmado de código (Code Signing) en esta fase (se deja para una fase posterior por requerir certificados de pago).
- Automatizar la subida a tiendas oficiales (Mac App Store, Microsoft Store).

## Decisions

### 1. Estrategia de Matrix en GitHub Actions
- **Decisión**: Usar una matriz de construcción con `ubuntu-latest`, `windows-latest` y `macos-latest`.
- **Razón**: Electron requiere el sistema operativo anfitrión nativo para compilar ciertos módulos y empaquetar instaladores específicos (especialmente DMG y NSIS).

### 2. Formatos de Paquetes Linux
- **Decisión**: Generar `AppImage`, `deb`, `rpm` y `pacman`.
- **Razón**: Cubre el 95% de la base de usuarios de Linux (familias Debian, RedHat y Arch) garantizando la máxima compatibilidad nativa solicitada por el usuario.

### 3. Disparador de la Pipeline
- **Decisión**: El workflow se activará mediante el empuje (push) de tags con el patrón `v*` (ej. `v1.0.0`).
- **Razón**: Permite un control preciso de cuándo se genera una release oficial, separando el desarrollo diario de los despliegues públicos.

### 4. Gestor de Paquetes
- **Decisión**: Usar `pnpm` con acciones de caché oficiales.
- **Razón**: Consistencia con el entorno de desarrollo local y eficiencia en los tiempos de instalación de dependencias en el CI.

## Risks / Trade-offs

- **[Riesgo] Ausencia de Firmado de Código** → **[Mitigación]** Advertir en la documentación y en la primera ejecución de la aplicación sobre el carácter experimental y la necesidad de aceptar los diálogos de seguridad del sistema operativo.
- **[Trade-off] Tiempo de Compilación** → La compilación multi-plataforma puede tardar entre 5 y 10 minutos. Se usará caché de dependencias para minimizar este impacto.
- **[Riesgo] Límites de GitHub Actions** → La compilación de Electron consume bastantes minutos de CPU. Se monitorizará el consumo para no exceder los límites gratuitos.
