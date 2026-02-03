## 1. Configuración e Infraestructura

- [x] 1.1 Instalar dependencias de desarrollo: `vitest` y `@vitest/coverage-v8`.
- [x] 1.2 Crear archivo de configuración `vitest.config.ts` en la raíz del proyecto.
- [x] 1.3 Agregar scripts `test` y `test:watch` al archivo `package.json`.
- [x] 1.4 Verificar que el comando `pnpm test` se ejecute correctamente (aunque no encuentre tests o pase vacío).

## 2. Pruebas Unitarias de Servicios

- [x] 2.1 Crear prueba unitaria para `EnvironmentManager` (`src/main/services/EnvironmentManager.test.ts`) cubriendo resolución de variables.
- [x] 2.2 Crear prueba unitaria para `RequestExecutor` (`src/main/services/RequestExecutor.test.ts`) cubriendo ejecución básica y mockeando dependencias si es necesario.
- [x] 2.3 Ejecutar todas las pruebas y asegurar que pasan.
