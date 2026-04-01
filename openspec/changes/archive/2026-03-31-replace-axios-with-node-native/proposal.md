## Why

Se ha identificado la necesidad de reducir las dependencias externas del proyecto para mejorar la seguridad y el mantenimiento a largo plazo. Recientemente, se han reportado vulnerabilidades en la librería Axios, lo que motiva su sustitución por las capacidades nativas de Node.js (módulo `https`). Esto garantiza un mayor control sobre la ejecución de peticiones y reduce la superficie de ataque.

## What Changes

- Sustitución completa de `axios` por el módulo nativo `https` de Node.js en el servicio de ejecución de peticiones.
- Eliminación de la dependencia `axios` del archivo `package.json`.
- Refactorización de `RequestExecutor.ts` para manejar manualmente flujos de datos, cabeceras y errores.
- **BREAKING**: Cualquier plugin o extensión que dependa directamente de la instancia de Axios dejará de funcionar y deberá adaptarse al nuevo ejecutor nativo.

## Capabilities

### New Capabilities
- `native-http-executor`: Implementación de un cliente HTTP robusto basado exclusivamente en módulos nativos de Node.js.

### Modified Capabilities
- `core-foundation`: Se actualiza el núcleo del sistema para eliminar la dependencia de librerías de terceros para la red.

## Impact

- `src/main/services/RequestExecutor.ts`: Archivo principal afectado por la lógica de red.
- `package.json`: Eliminación de `axios`.
- `src/shared/types.ts`: Posibles cambios en la estructura de respuesta para estandarizarla sin las abstracciones de Axios.
