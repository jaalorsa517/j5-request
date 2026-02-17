## 1. UI Toggle Implementation

- [x] 1.1 Localizar el componente `MainLayout.vue` y confirmar la ubicación de la barra de actividad (`.activityBar`).
- [x] 1.2 Implementar el botón de alternancia (`toggleTheme`) en la Activity Bar si no existe, o verificar su funcionalidad si ya está presente.
- [x] 1.3 Asegurar que el icono (☀️/🌙) cambie dinámicamente según el estado del store (`themeStore.theme`).

## 2. Corrección de Estilos (Bug Fixes)

- [x] 2.1 Auditar `RequestTabBar.vue` para identificar estilos con colores fijos (hex, rgb) que no usen variables CSS.
- [x] 2.2 Reemplazar colores hardcodeados en `RequestTabBar` por variables CSS definidas en `style.css` (e.g., `var(--bg-secondary)`).
- [x] 2.3 Verificar `RequestPanel.vue` y `ResponsePanel.vue` para asegurar legibilidad en modo claro.
- [x] 2.4 Verificar que el borde activo y hover en las pestañas sea visible en ambos modos.

## 3. Validación

- [x] 3.1 Ejecutar la aplicación y verificar el ciclo completo de cambio de tema.
- [x] 3.2 Comprobar visualmente que no existan textos ilegibles o fondos incorrectos en modo claro.
