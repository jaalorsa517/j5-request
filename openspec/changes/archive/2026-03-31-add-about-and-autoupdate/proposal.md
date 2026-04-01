## Why

Actualmente, la aplicación carece de una sección informativa que muestre la versión del software y los créditos del autor, lo que dificulta a los usuarios identificar qué versión están ejecutando. Además, para garantizar la sostenibilidad y actualización del proyecto, se requiere un mecanismo de donaciones integrado y un sistema de actualizaciones automáticas que mantenga a los usuarios en la versión más reciente sin intervención manual.

## What Changes

- **Ventana de "Acerca de"**: Implementación de un diálogo informativo que muestre la versión actual, el autor y la descripción del proyecto.
- **Integración de Donaciones**: Adición de botones de PayPal para donaciones tanto en el README del repositorio como en la interfaz de la aplicación.
- **Sistema de Auto-update**: Configuración de `electron-updater` para detectar, descargar e instalar nuevas versiones de la aplicación automáticamente.
- **Actualización de Documentación**: Inclusión del distintivo de donación en el README principal.

## Capabilities

### New Capabilities
- `application-info`: Provee información sobre la versión, autor y créditos de la aplicación.
- `auto-update-infrastructure`: Infraestructura para la gestión de actualizaciones automáticas del cliente Electron.
- `funding-integration`: Gestión de los puntos de contacto para donaciones y apoyo al proyecto.

### Modified Capabilities
- `core-foundation`: Actualización para incluir las dependencias de actualización y metadatos de versión.

## Impact

- `src/main/main.ts`: Configuración de los eventos del auto-updater.
- `src/renderer/components/`: Nuevo componente para el diálogo "Acerca de".
- `package.json`: Adición de `electron-updater` y scripts relacionados.
- `README.md`: Adición del banner de donación.
