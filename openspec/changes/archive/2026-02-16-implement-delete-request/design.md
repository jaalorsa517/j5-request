# Diseño: Implementar Eliminar Petición

## Contexto
La aplicación permite crear y editar peticiones pero carece de la capacidad de eliminarlas desde la interfaz. Esto introduce una función de eliminación de archivos accesible a través de la UI.

## Objetivos / No-Objetivos
**Objetivos**:
- Permitir eliminar archivos y carpetas directamente desde la barra lateral de la aplicación.
- Implementar un menú contextual para acciones en archivos/carpetas.
- Proporcionar un diálogo de confirmación para prevenir pérdida de datos accidental.
- Asegurar que el estado de la UI (pestañas abiertas, archivo seleccionado) se actualice correctamente tras la eliminación.

**No-Objetivos**:
- Mover archivos a la papelera de reciclaje del sistema (los archivos se eliminarán permanentemente vía `fs.rm`).
- Funcionalidad de deshacer para la eliminación.

## Decisiones

### 1. Interacción UI: Menú Contextual
- **Componente**: Crear un componente `ContextMenu.vue` que se pueda posicionar absolutamente basado en las coordenadas del ratón.
- **Disparador**: Escuchar el evento `@contextmenu` en los ítems del árbol de archivos.
- **Acciones**: Inicialmente solo "Eliminar", pero diseñado para soportar "Renombrar" u otras acciones en el futuro.

### 2. Diálogo de Confirmación
- **Componente**: Crear un componente genérico `ConfirmModal.vue`.
- **Props**: `isOpen` (booleano), `title` (título), `message` (mensaje), `confirmText` (texto confirmar), `cancelText` (texto cancelar).
- **Comportamiento**: Overlay modal que bloquea la interacción con el resto de la app hasta confirmar o cancelar.

### 3. Integración Backend
- **Servicio**: Reutilizar el método existente `FileSystemService.deletePath` expuesto vía canal IPC `fs:delete`.
- **Manejo de Errores**: Capturar y mostrar errores si la eliminación falla (ej. problemas de permisos).

### 4. Gestión de Estado (Store)
- **FileSystemStore**:
  - La acción `deleteItem(path)` invocará la llamada IPC.
  - Tras el éxito, verificar si la ruta eliminada coincide o contiene la ruta del archivo seleccionado actualmente. Si es así, limpiar la selección.
- **RequestStore**:
  - Necesita estar al tanto de los archivos cerrados. `FileSystemStore` o el componente UI que maneja la eliminación debería disparar `RequestStore.closeTab(path)` para el archivo eliminado (y cualquier archivo dentro de una carpeta eliminada).
  - Dado que `RequestStore` gestiona las pestañas, necesitamos una forma de cerrar múltiples pestañas si se elimina una carpeta. Idealmente `RequestStore` expone `closeTabsByPathPrefix(path)`.

## Riesgos / Compromisos
- **Pérdida de Datos**: La eliminación permanente es arriesgada. El diálogo de confirmación debe ser claro y distintivo (ej. usando un estilo de "peligro").
- **Archivos Abiertos**: Si se elimina un archivo mientras está abierto y sin guardar, los cambios se perderán. El mensaje de confirmación debería implicar esto.
