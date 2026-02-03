## Why

Actualmente la aplicación utiliza archivos `.json` genéricos para guardar y abrir peticiones. Esto no distingue los archivos propios de la aplicación de otros archivos JSON, y muestra todos los archivos en el explorador, dificultando la navegación. El uso de una extensión propia `.j5request` permitirá filtrar y mostrar solo los archivos relevantes para la aplicación, mejorando la experiencia de usuario y la organización.

## What Changes

- **Cambio de Extensión**: Se utilizará `.j5request` como la extensión predeterminada para todos los archivos de petición.
- **Filtrado de Archivos**: El explorador de archivos y los diálogos de abrir/guardar solo mostrarán archivos con extensión `.j5request` (además de directorios).
- **Lectura/Escritura**: La lógica de persistencia se actualizará para validar y escribir esta nueva extensión.
- **Compatibilidad**: (Implícito) Se dejará de dar soporte principal a `.json` para la vista de archivos, aunque el formato interno siga siendo JSON.

## Capabilities

### New Capabilities
<!-- No new capabilities, just modifying existing filesystem behavior -->

### Modified Capabilities
- `filesystem-management`: Se modifica el requisito de selección de archivos para reemplazar `.json` por `.j5request`.

## Impact

- **Frontend**: Componentes de árbol de archivos, lógica de filtrado de archivos.
- **Backend/IPC**: Handlers de lectura y escritura de archivos, validación de extensiones.
- **Usuarios**: Los archivos `.json` existentes podrían dejar de ser visibles; se asume que esta es una transición deseada o un "breaking change" aceptable en esta etapa.
