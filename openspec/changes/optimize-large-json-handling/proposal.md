## Why

El proyecto ha alcanzado una etapa de madurez donde el manejo de grandes volúmenes de datos JSON (respuestas de API de varios megabytes, importaciones masivas de colecciones) es crítico para la experiencia de usuario y la estabilidad del sistema. La carga actual de estos datos puede causar bloqueos en la interfaz de usuario (UI freeze) y un consumo excesivo de memoria.

## What Changes

- **Parseo Optimizado**: Migrar el procesamiento de grandes estructuras JSON al proceso utilitario (worker) para evitar el bloqueo del hilo principal y del renderizador.
- **Visualización Virtualizada**: Implementar técnicas de virtualización o carga perezosa (lazy loading) en el visor de respuestas para manejar JSONs de gran tamaño sin degradar el rendimiento de la UI.
- **Mejora en Monaco Editor**: Configurar el editor Monaco con opciones de rendimiento específicas para archivos grandes (ej. desactivar validación pesada si el archivo supera cierto umbral).
- **Importación por Streaming**: Refactorizar el motor de importación para procesar archivos grandes en bloques en lugar de cargar todo el contenido en memoria de una sola vez.

## Capabilities

### New Capabilities
- `large-data-streaming`: Capacidad de procesar y transmitir grandes volúmenes de datos entre procesos sin saturar la memoria o bloquear la UI.

### Modified Capabilities
- `api-import`: Los procesos de importación deben ser asíncronos y soportar archivos de gran tamaño.
- `ui-response-viewer`: El visor debe ser capaz de renderizar respuestas JSON pesadas de forma fluida.
- `ui-editor-monaco`: El editor debe ajustarse dinámicamente para mantener la fluidez con contenidos extensos.

## Impact

- `src/worker/worker.ts`: Lógica de procesamiento de datos pesados.
- `src/renderer/components/ResponsePanel.vue`: Implementación de visualización optimizada.
- `src/renderer/components/MonacoEditor.vue`: Configuración de rendimiento.
- `src/shared/utils/`: Utilidades de manejo de JSON y buffers.
