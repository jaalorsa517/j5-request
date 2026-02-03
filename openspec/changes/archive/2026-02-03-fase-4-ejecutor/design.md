## Context

Actualmente, la aplicación J5-Request tiene una interfaz básica y un sistema de archivos, pero no puede ejecutar peticiones HTTP reales ni procesar lógica personalizada. La fase 4 busca implementar el motor de ejecución "Ejecutor", que es el corazón de la herramienta.

## Goals / Non-Goals

**Goals:**
- Implementar un ejecutor de peticiones HTTP robusto en el proceso Main de Electron.
- Crear un entorno aislado (Sandbox) para ejecutar scripts de usuario (JS/TS) de forma segura.
- Implementar un sistema de variables de entorno y reemplazo de variables en tiempo de ejecución (ej. `{{token}}`).
- Asegurar que las respuestas grandes (>10MB) no bloqueen la UI.

**Non-Goals:**
- Implementar autocompletado avanzado en el editor de código (esto es parte de la Fase 2/Mejoras UI).
- Sincronización en la nube de entornos.
- Ejecución de colecciones completas (Runner) - esto se limitará a petición individual por ahora.

## Decisions

### 1. Motor de Ejecución en Main Process
Se ejecutará toda la lógica de red en el proceso Main usando `axios` o `node-fetch` adaptado.
**Razón:** Evitar problemas de CORS que limitan a los navegadores (y al Renderer de Electron) y tener acceso directo al sistema de archivos para guardar respuestas si es necesario.

### 2. Sandbox con Node `vm`
Utilizaremos el módulo nativo `vm` de Node.js para crear contextos aislados.
**Razón:** Librerías externas como `vm2` tienen problemas de mantenimiento. Para una herramienta de escritorio local, `vm` con un contexto limpio (sin acceso a `require`, `process`, etc.) provee suficiente seguridad y aislamiento para scripts de pre/post request.

### 3. IPC para Ciclo de Vida
El flujo será atómico desde la vista del Renderer:
1. Renderer envía `EXECUTE_REQUEST` con la definición y el entorno activo.
2. Main crea sandbox -> ejecuta Pre-request script -> actualiza variables.
3. Main ejecuta HTTP Request.
4. Main ejecuta Post-response script -> actualiza variables.
5. Main devuelve `EXECUTION_RESULT` con respuesta y variables modificadas.

### 4. Gestión de Variables
Las variables se resolverán mediante sustitución de strings (regex) justo antes de la ejecución. Los scripts tendrán acceso a un objeto `pm` (similar a Postman) para leer/escribir variables programáticamente.

## Risks / Trade-offs

- **Seguridad del Sandbox**: Siempre existe el riesgo de que un script malicioso intente escapar del sandbox. Se mitigará limitando estrictamente el objeto global expuesto.
- **Performance**: La serialización de grandes respuestas entre Main y Renderer puede ser lenta. Se evaluará el uso de archivos temporales o streams si el paso de mensajes JSON es cuello de botella.
