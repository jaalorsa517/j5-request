## 1. Store y Modelo de Datos

- [x] 1.1 Definir el tipo `RequestTab` y actualizar el estado inicial del store.
   - Crear `src/domain/types/RequestTab.ts` (o similar).
   - Validar estructura: `id` (uuid), `name`, `request` (estado actual), `response` (opcional).
- [x] 1.2 Implementar acciones del Store para gestión de pestañas (TDD).
   - `addTab()`: Crea una nueva pestaña y la marca como activa.
   - `closeTab(id)`: Elimina la pestaña. Si era activa, cambia a la adyacente.
   - `setActiveTab(id)`: Cambia el `activeTabId`.
   - `updateTabRequest(id, data)`: Actualiza los datos de la solicitud en la pestaña específica.
   - Escribir pruebas unitarias para todas las acciones cubriendo casos borde (cerrar última pestaña, intentar cerrar ID inexistente).

## 2. Componente TabBar

- [x] 2.1 Crear componente `RequestTabs.vue` (Implementado como `RequestTabBar.vue`).
   - Implementar renderizado de lista de pestañas basado en el store.
   - Estilar pestañas (activa vs inactiva).
   - Botón de "Nueva Pestaña" (+).
   - Botón de "Cerrar" (x) en cada pestaña.
- [x] 2.2 Implementar lógica de interacción en `RequestTabs.vue` (TDD).
   - Click en pestaña -> llama a `setActiveTab`.
   - Click en cerrar -> llama a `closeTab`.
   - Click en agregar -> llama a `addTab`.
   - Pruebas de componente verificando emisión de eventos o llamadas al store.

## 3. Integración en Layout Principal

- [x] 3.1 Actualizar `MainLayout.vue` (o componente contenedor principal).
   - Insertar `RequestTabs` sobre el área del editor.
   - Ajustar estilos CSS/Grid para acomodar la nueva barra.

## 4. Sincronización del Editor y Respuesta

- [x] 4.1 Actualizar componentes de edición (`RequestEditor`, `UrlBar`, etc.).
   - Asegurar que los inputs (URL, Método, Headers, Body) lean del `activeTab` del store.
   - Asegurar que los cambios en inputs disparen `updateTabRequest` para la pestaña ACTIVA.
- [x] 4.2 Sincronización de Monaco Editor.
   - Verificar que al cambiar de pestaña, el contenido del editor de código se actualice correctamente al `body` de la nueva pestaña activa.
- [x] 4.3 Visualización de Respuesta.
   - Asegurar que el componente de respuesta (`ResponseViewer`) muestre los datos de la pestaña activa.

## 5. Pruebas y Cobertura

- [x] 5.1 Verificar cobertura de pruebas unitarias del Store (100%).
- [x] 5.2 Verificar cobertura de pruebas de componentes (TabBar, Editor interactuando con tabs).
- [x] 5.3 Ejecutar pruebas de integración manuales para validar flujos de usuario (Crear, Editar, Cambiar, Cerrar).
