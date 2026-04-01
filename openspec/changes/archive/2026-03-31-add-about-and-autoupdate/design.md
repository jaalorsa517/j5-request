## Context

La aplicación carece de una sección "Acerca de" y un sistema de actualización automática. Actualmente, la versión del software se gestiona únicamente en el `package.json` y los usuarios deben descargar manualmente las nuevas versiones desde el repositorio de GitHub.

## Goals / Non-Goals

**Goals:**
- Implementar un diálogo "Acerca de" accesible desde la interfaz de usuario.
- Configurar `electron-updater` para gestionar actualizaciones automáticas de forma transparente.
- Añadir puntos de entrada para donaciones vía PayPal.

**Non-Goals:**
- Implementar un sistema de autenticación de usuarios.
- Rediseñar la interfaz principal de la aplicación.

## Decisions

### 1. Sistema de Actualización Automática
- **Decisión**: Utilizar `electron-updater`.
- **Razón**: Es la solución estándar para aplicaciones Electron empaquetadas con `electron-builder`. Soporta actualizaciones diferenciales y es fácil de integrar con GitHub Releases.
- **Alternativa**: Implementar un sistema manual de descarga. Se descartó por la complejidad de gestión de versiones y la mala experiencia de usuario.

### 2. Obtención de Metadatos
- **Decisión**: Exponer los metadatos de `package.json` a través de IPC.
- **Razón**: El proceso renderizador no tiene acceso directo al sistema de archivos por seguridad. El proceso principal leerá la versión y el autor y los enviará al renderizador cuando se solicite el diálogo "Acerca de".

### 3. Enlaces Externos (Donaciones)
- **Decisión**: Utilizar `shell.openExternal` en el proceso principal.
- **Razón**: Por seguridad, los enlaces a sitios externos deben abrirse en el navegador predeterminado del sistema operativo, no dentro de la ventana de Electron.

## Risks / Trade-offs

- **[Riesgo] Fallo en la descarga de actualización** → **[Mitigación]** Implementar logs de error y notificar al usuario solo cuando la actualización esté lista para ser instalada.
- **[Trade-off] Tamaño del paquete** → La inclusión de `electron-updater` añade una pequeña sobrecarga al tamaño del ejecutable final.
