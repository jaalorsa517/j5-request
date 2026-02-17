# Tareas: Implementar Eliminar Petición

## 1. Verificación y Configuración Backend
- [x] 1.1 Verificar la implementación del manejador IPC `fs:delete` en `ipc.ts` para asegurar corrección.
- [x] 1.2 Verificar que `preload/index.ts` expone `fs.delete`.

## 2. Actualizaciones del Store
- [x] 2.1 Actualizar `RequestStore` para añadir la acción `closeTabByPath` (o asegurar que `closeTab` existe y maneja coincidencias de ruta).
- [x] 2.2 Actualizar `FileSystemStore` para coordinar la eliminación:
    - Llamar a `fs.delete` vía IPC.
    - Si es exitoso, disparar `RequestStore.closeTab` para el elemento eliminado (y descendientes si es carpeta).
    - Limpiar `selectedFile` si es necesario.

## 3. Componentes UI
- [x] 3.1 Crear el componente `src/renderer/components/ContextMenu.vue`.
    - Props: `x` (número), `y` (número), `items` (array de etiqueta/acción).
    - Eventos: `action` (retorna ítem), `close`.
- [x] 3.2 Crear el componente `src/renderer/components/ConfirmModal.vue`.
    - Props: `isOpen` (booleano), `title` (string), `message` (string), `confirmText`, `cancelText`.
    - Eventos: `confirm`, `cancel`.

## 4. Integración - Barra Lateral/Árbol de Archivos
- [x] 4.1 Actualizar `FileTreeItem.vue` para emitir evento `@contextmenu` con ruta y tipo (archivo/carpeta) al hacer clic derecho.
- [x] 4.2 Actualizar `FileTree.vue` (contenedor padre) para:
    - Escuchar eventos `contextmenu` de los ítems.
    - Mostrar `ContextMenu` en la posición del cursor.
    - Manejar la selección "Eliminar" del menú.
- [x] 4.3 Implementar flujo de eliminación en `FileTree.vue`:
    - Mostrar `ConfirmModal` con advertencia apropiada (Archivo vs Carpeta).
    - Al confirmar, llamar a `FileSystemStore.deleteItem`.
    - Manejar errores (mostrar notificación o alerta).

## 5. Pruebas
- [x] 5.1 Crear pruebas unitarias para `ContextMenu.vue`.
- [x] 5.2 Crear pruebas unitarias para `ConfirmModal.vue`.
- [x] 5.3 Actualizar pruebas del store (`FileSystemStore`) para cubrir lógica de eliminación y efectos secundarios.
- [x] 5.4 Verificación manual: Eliminar archivo, Eliminar carpeta con archivos, Cancelar eliminación.
