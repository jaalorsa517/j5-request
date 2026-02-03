## 1. Environment Manager

- [x] 1.1 Crear clase `EnvironmentManager` para gestionar variables globales y de entorno.
- [x] 1.2 Implementar método `resolveVariables(template: string, env: object): string` para sustituir `{{var}}`.
- [x] 1.3 Implementar lógica para cargar/guardar entornos desde archivos `.json`.

## 2. Sandbox de Scripting

- [x] 2.1 Crear servicio `ScriptExecuter` usando módulo `vm` de Node.
- [x] 2.2 Definir e implementar la API segura `pm` (get/set environment, response access).
- [x] 2.3 Implementar timeout y captura de errores en la ejecución de scripts.

## 3. Motor de Peticiones (Main Process)

- [x] 3.1 Instalar dependencias necesarias (`axios` o `node-fetch`) en el proceso Main.
- [x] 3.2 Crear handler `handleRequestExecution` que reciba la petición cruda.
- [x] 3.3 Integrar **Pre-request Script**: Ejecutar antes de la petición y actualizar variables.
- [x] 3.4 Ejecutar la petición HTTP y capturar respuesta (status, headers, body).
- [x] 3.5 Integrar **Post-response Script**: Ejecutar después de la petición, exponiendo `pm.response`.

## 4. Integración IPC

- [x] 4.1 Definir canales IPC `EXECUTE_REQUEST` en `shared/constants`.
- [x] 4.2 Registrar handlers en `main/index.ts` o módulo dedicado `main/request-executor`.
- [x] 4.3 Crear método en `preload` para exponer la ejecución al Renderer.
- [x] 4.4 Probar flujo completo con una petición de prueba (log en consola del Main).
