## Why

Actualmente, el proyecto `j5-request` opera sin una suite de pruebas automatizadas. A medida que avanzamos con fases complejas como Operaciones Git y el Ejecutor de Peticiones avanzado, el riesgo de regresión aumenta significativamente. Para asegurar la estabilidad y "preservar las funcionalidades actuales" como se solicitó, necesitamos una base sólida de pruebas unitarias. Esto nos permitirá refactorizar y expandir con confianza, sabiendo que la lógica central permanece intacta.

## What Changes

- **Infraestructura**: Instalar y configurar **Vitest** como el ejecutor de pruebas (nativo del ecosistema Vite).
- **Configuración**: Configurar Vitest para soportar entornos Node.js (Proceso Principal) y JSDOM (Proceso Renderizador) si es necesario, enfocándose principalmente en los servicios del Proceso Principal primero.
- **Scripts**: Agregar scripts `test` y `test:watch` al `package.json`.
- **Cobertura**: Implementar pruebas unitarias iniciales para servicios críticos existentes:
    - `RequestExecutor` (Lógica central de manejo de peticiones)
    - `EnvironmentManager` (Resolución de variables)

## Capabilities

### New Capabilities

- `unit-testing-infrastructure`: Configuración de Vitest, archivos de configuración y scripts npm.
- `core-services-tests`: Implementación de pruebas unitarias para `RequestExecutor` y `EnvironmentManager` para verificar el comportamiento actual.

### Modified Capabilities

- Ninguna. (Estamos agregando una capa de pruebas paralela, no modificando el comportamiento en tiempo de ejecución de las capacidades existentes).

## Impact

- **Archivos**:
    - `package.json` (nuevas devDependencies, scripts)
    - `vitest.config.ts` (nuevo)
    - `src/main/services/*.test.ts` (nuevos archivos de prueba)
- **Dependencias**: Agrega `vitest`, `@vitest/coverage-v8` (opcional pero recomendado), y potencialmente `jsdom` o `happy-dom`.
- **Flujo de trabajo**: Los desarrolladores deberán ejecutar `pnpm test` antes de realizar commits.