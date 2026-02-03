## Context

El proyecto `j5-request` está construido sobre Electron, Vue 3 y Vite. Actualmente carece de pruebas automatizadas. La lógica de negocio crítica reside principalmente en el "Main Process" de Electron (servicios de Node.js) y en los Stores de Vue. Necesitamos integrar una herramienta de testing que sea compatible con Vite para minimizar la fricción de configuración.

## Goals / Non-Goals

**Goals:**
- Integrar **Vitest** en el flujo de desarrollo existente.
- Habilitar pruebas unitarias para lógica de Node.js (Main Process) y lógica agnóstica del framework.
- Lograr que los comandos `pnpm test` ejecuten las pruebas de manera rápida y fiable.
- Probar los servicios críticos: `RequestExecutor` y `EnvironmentManager`.

**Non-Goals:**
- Pruebas End-to-End (E2E) con Playwright o Cypress (fuera del alcance de esta iteración).
- Pruebas de Renderizado de Componentes Vue (Testing Library) por el momento (foco en lógica pura).
- Cobertura del 100% inmediata (foco en infraestructura y rutas críticas).

## Decisions

### 1. Selección de Framework: Vitest
**Decisión:** Usar **Vitest**.
**Razón:** Es nativo para Vite. Comparte la misma configuración (`vite.config.ts`), lo que elimina la necesidad de duplicar la configuración de alias, plugins y transformaciones de TypeScript que requeriría Jest. Es significativamente más rápido en modo watch.
**Alternativas:** Jest (estándar de la industria, pero pesado de configurar con Vite/TS), Mocha (demasiado manual).

### 2. Ubicación de Pruebas: Co-ubicación
**Decisión:** Archivos de prueba junto al código fuente (`archivo.ts` -> `archivo.test.ts`).
**Razón:** Facilita la navegación, mantiene las pruebas visibles y fomenta que se actualicen al modificar el código.
**Alternativas:** Carpeta `__tests__` separada o carpeta `tests/` raíz.

### 3. Estrategia de Mocking para Electron
**Decisión:** Usar `vi.mock` para módulos de Electron cuando sea necesario, pero preferir probar lógica pura desacoplada.
**Razón:** Los servicios actuales parecen estar razonablemente desacoplados, pero si `RequestExecutor` usa `fs` o `axios`, Vitest facilita su mocking.

## Risks / Trade-offs

- **Riesgo**: Dependencias de Electron en el Main Process.
  - **Mitigación**: Si un servicio importa `electron` directamente y falla en el entorno de prueba, usaremos mocks de Vitest o refactorizaremos ligeramente para inyectar dependencias.
- **Riesgo**: Configuración dual (Node vs DOM).
  - **Mitigación**: Configuraremos Vitest con `environment: 'node'` por defecto para los servicios del backend. Si probamos stores de Vue en el futuro, se puede anular esta configuración por archivo o usar `happy-dom`.
