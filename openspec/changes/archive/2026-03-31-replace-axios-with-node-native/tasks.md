## 1. Limpieza de Dependencias

- [x] 1.1 Eliminar `axios` del archivo `package.json`.
- [x] 1.2 Ejecutar `pnpm install` para actualizar el archivo de bloqueo y node_modules.

## 2. Refactorización del Ejecutor (RequestExecutor.ts)

- [x] 2.1 Implementar clase interna `NativeHttpClient` usando `http` y `https` de Node.js.
- [x] 2.2 Migrar la lógica de resolución de variables y certificados SSL a la nueva implementación nativa.
- [x] 2.3 Asegurar que el manejo de errores devuelva el mismo formato esperado por el frontend.
- [x] 2.4 Implementar el procesamiento de flujos (streams) para leer el cuerpo de la respuesta.

## 3. Validación y Pruebas

- [x] 3.1 Actualizar los tests unitarios de `RequestExecutor.test.ts` para mockear los módulos nativos de Node en lugar de Axios.
- [x] 3.2 Realizar pruebas de integración con una API real (ej. JSONPlaceholder) para verificar GET y POST.
- [x] 3.3 Verificar que el soporte de certificados SSL personalizados sigue funcionando correctamente.
