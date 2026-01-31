## Context
El repositorio actual está vacío. Se requiere crear una aplicación de escritorio para consumo de APIs que cumpla con principios de "API-as-Code", permitiendo colaboración mediante Git y alto rendimiento.

## Goals / Non-Goals
**Goals:**
- Inicializar el proyecto con una estructura escalable usando Electron, Vue 3 y TypeScript.
- Configurar el sistema de construcción con `electron-vite`.
- Establecer una arquitectura de multiprocesos para asegurar que la UI no se bloquee con respuestas grandes.
- Definir el formato de archivo para la persistencia de peticiones.

**Non-Goals:**
- Implementar todas las funcionalidades de edición de peticiones (headers, body, etc.) en esta fase.
- Importación/Exportación completa de colecciones.
- Ejecución de scripts de usuario sandboxeados (solo se dejará la estructura lista).

## Decisions

### Stack Tecnológico
Se utilizará **`electron-vite`** como base. Esto provee una configuración de build optimizada con Rollup y Esbuild, soporte nativo para TypeScript y HMR (Hot Module Replacement) rápido para Main, Preload y Renderer processes.

### Arquitectura de Procesos
Para cumplir con el requerimiento de rendimiento (JSONs de 10MB+) y seguridad (CORS), se opta por:
1.  **Main Process**: Orquestación de ventanas y ciclo de vida de la app.
2.  **Request Worker (Utility Process)**: Un proceso Node.js hijo dedicado exclusivamente a realizar peticiones HTTP y procesar datos pesados. Se comunicará con el Renderer vía MessagePorts o IPC.
3.  **Renderer Process**: Vue 3 + Pinia para la interfaz visual. Mantendrá solo el estado necesario para la vista.

### Persistencia y Formato de Archivo
Se define el formato `*.j5api` como el estándar de almacenamiento.
- **Formato**: JSON estrictamente formateado (human-readable).
- **Contenido**: Corresponderá a una simplificación de un "Path Item Object" de OpenAPI, conteniendo solo la información esencial de la petición (método, url, params, body).
- **Justificación**: Facilita la lectura en Git diffs y permite una transformación directa a OpenAPI para exportación.

## Risks / Trade-offs
- **Complejidad IPC**: La comunicación asíncrona entre Renderer y Worker añade complejidad al manejo de estado y errores. Se mitigará usando tipos compartidos estrictos.
