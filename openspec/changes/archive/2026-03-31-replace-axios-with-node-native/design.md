## Context

El proyecto utiliza actualmente `axios` para todas las peticiones salientes. Debido a preocupaciones de seguridad y el deseo de un núcleo minimalista, se ha decidido migrar a las capacidades nativas de Node.js. Dado que el proyecto corre en el proceso principal de Electron (Node.js), el módulo `https` (y `http`) es la opción más estable y compatible con versiones anteriores de Node, aunque se evaluará el uso de `fetch` si está disponible de forma nativa en la versión de Node utilizada por el entorno.

## Goals / Non-Goals

**Goals:**
- Eliminar la dependencia `axios` del proyecto.
- Mantener la funcionalidad completa de ejecución de peticiones (GET, POST, PUT, DELETE, PATCH).
- Soportar cabeceras personalizadas, cuerpos de petición en JSON/form-data y configuración de certificados SSL.
- Proveer una estructura de respuesta compatible con la interfaz actual.

**Non-Goals:**
- Implementar funcionalidades avanzadas de Axios como interceptores globales (a menos que sean críticos para el flujo actual).
- Cambiar la lógica de negocio de cómo se procesan las respuestas en el frontend.

## Decisions

1. **Uso de módulos nativos (`http`/`https`)**: Se optará por los módulos clásicos por su granularidad en el manejo de certificados y flujos, esenciales para un cliente de API.
2. **Abstracción `NativeHttpClient`**: Se creará una clase interna en `RequestExecutor.ts` para encapsular la complejidad de Node (promesas, streams, buffers) y ofrecer una interfaz simple similar a la que usábamos con Axios.
3. **Manejo de SSL/TLS**: Se integrará la lógica de certificados cargada desde el sistema de archivos directamente en las opciones de `https.request`.

## Risks / Trade-offs

- **[Riesgo] Complejidad de Implementación** → Node nativo requiere más código que Axios para tareas simples (ej. leer el cuerpo de la respuesta). *Mitigación*: Pruebas unitarias exhaustivas en `RequestExecutor`.
- **[Trade-off] Mayor control vs Facilidad** → Perdemos la comodidad de Axios pero ganamos inmunidad ante vulnerabilidades de terceros y una base de código más ligera.
