# Tareas de Implementación

## 1. Configuración de Infraestructura de Cobertura

- [x] 1.1 Instalar dependencia `@vitest/coverage-v8` como devDependency.
- [x] 1.2 Actualizar `vitest.config.ts` para habilitar la recolección de cobertura usando el proveedor `v8`.
- [x] 1.3 Configurar patrones de exclusión en `vitest.config.ts` para ignorar archivos irrelevantes (configuraciones, tipos, dist, mocks).
- [x] 1.4 Añadir script `test:coverage` en `package.json` que ejecute `vitest run --coverage`.
- [x] 1.5 Verificar la generación de reportes en la carpeta `coverage/` y asegurar que esta carpeta esté en `.gitignore`.

## 2. Establecimiento de Umbrales y Mejora de Cobertura

- [x] 2.1 Configurar umbrales de cobertura en `vitest.config.ts`: 90% para `lines`, `functions`, `branches`, y `statements`.
- [x] 2.2 Ejecutar `pnpm run test:coverage` para obtener el estado actual y listar los módulos que no cumplen el umbral.
- [x] 2.3 Crear o mejorar pruebas unitarias para los módulos identificados con baja cobertura, priorizando la lógica de negocio y utilitarios.
- [x] 2.4 Continuar iterando en la creación de pruebas hasta alcanzar el 90% global en todas las métricas.
- [x] 2.5 Verificar que el comando `test:coverage` finalice exitosamente (exit code 0) al cumplir los umbrales.
