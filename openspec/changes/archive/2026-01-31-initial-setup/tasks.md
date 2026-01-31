## 1. Configuración Inicial y Scaffolding

- [x] 1.1 Inicializar proyecto con `electron-vite` (Vue + TS).
- [x] 1.2 Instalar dependencias base (`pinia`, `sass` si es necesario, `typescript`).
- [x] 1.3 Limpiar archivos de ejemplo y asegurar estructura de carpetas (`src/main`, `src/preload`, `src/renderer`, `src/shared`).

## 2. Arquitectura de Procesos

- [x] 2.1 Configurar `electron.vite.config.ts` para soportar múltiples puntos de entrada si es necesario, o verificar la configuración base.
- [x] 2.2 Implementar `src/main/index.ts` para la gestión básica de ventanas y validación de seguridad.
- [x] 2.3 Crear scaffold para el `request-worker` (Utility Process o Node child_process fork).
    *   Nota: `electron-vite` soporta main/preload/renderer. Para un worker extra, requeriremos configuración adicional u otro entry point.
- [x] 2.4 Verificar que el Worker se inicia correctamente desde el Main process.

## 3. UI Hola Mundo

- [x] 3.1 Configurar Store de Pinia en Renderer.
- [x] 3.2 Crear vista principal que muestre el estado de conexión con los procesos (Main/Worker).
