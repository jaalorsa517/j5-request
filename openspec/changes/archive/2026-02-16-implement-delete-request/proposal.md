# Propuesta: Implementar Funcionalidad de Eliminar Petición

## Problema
Actualmente, los usuarios pueden crear, leer y actualizar peticiones, pero no existe un mecanismo para eliminarlas desde la aplicación. Los usuarios deben navegar al explorador de archivos del sistema operativo para borrar archivos `.j5request` o carpetas, lo cual interrumpe el flujo de trabajo y la experiencia de desarrollo.

## Solución
Implementar una opción de "Eliminar" dentro de la interfaz de la aplicación, accesible mediante un menú contextual en el árbol de archivos.
- **Menú Contextual**: Al hacer clic derecho en una petición o carpeta en la barra lateral, se mostrará una opción "Eliminar".
- **Confirmación**: Aparecerá un diálogo de confirmación para prevenir la pérdida accidental de datos.
- **Actualización de Estado**: Tras confirmar, el elemento se borrará del disco, se eliminará del árbol de archivos y, si el archivo eliminado estaba abierto en una pestaña, esta se cerrará.

## Qué Cambia

## Capacidades

### Nuevas Capacidades
- `request-deletion`: La capacidad de eliminar permanentemente archivos de petición y carpetas del sistema de archivos a través de la interfaz de usuario.
- `confirmation-dialog`: Un mecanismo de diálogo reutilizable para confirmar acciones destructivas.

### Capacidades Modificadas
- `file-explorer-interaction`: Actualizado para soportar menús contextuales y acciones destructivas.

## Impacto

1.  **Backend**: Verificar que el manejador IPC `fs:delete` (ya existente) funcione como se espera.
2.  **Frontend**:
    -   **Componentes**: Implementar un Menú Contextual para el Árbol de Archivos.
    -   **Store**: Actualizar `FileSystemStore` para manejar la lógica de eliminación.
    -   **UI**: Añadir un Modal de Confirmación para acciones de borrado.
