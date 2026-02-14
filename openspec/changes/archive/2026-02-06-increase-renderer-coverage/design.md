# Design: Estrategia de Pruebas para Renderer

## Context
La expansión del reporte de cobertura ha revelado que la gran mayoría de la interfaz de usuario y la gestión de estado del cliente carecen de pruebas automatizadas. Esto representa la mayor parte de la deuda de calidad actual.

## Goals / Non-Goals

**Goals:**
- Implementar pruebas unitarias para Pinia Stores (`src/renderer/stores`).
- Implementar pruebas unitarias para componentes Vue críticos (`src/renderer/components`).
- Configurar el entorno de test (`setupFiles`) para manejar dependencias del navegador y Electron (mocks de `window.electron`, `localStorage`, etc.).
- Aumentar la cobertura global progresivamente.

**Non-Goals:**
- Pruebas E2E (End-to-End) con herramientas como Playwright o Cypress. El foco es unit/component testing con Vitest.
- Refactorización visual de componentes. Solo cambios mínimos necesarios para hacerlos testables.

## Decisions

### 1. Entorno de Pruebas: `jsdom` o `happy-dom`
El proyecto ya usa `node` como entorno por defecto. Para pruebas de componentes Vue, necesitaremos un entorno que simule el DOM.
- **Decisión**: Usar `jsdom` (o `happy-dom` si es más ligero) para los archivos `.test.ts` dentro de `renderer`. Vitest permite configurar entornos por archivo o carpeta. Configuraremos esto en `vitest.config.ts` o mediante comentarios en los archivos de test.

### 2. Mocks Globales
Los componentes dependen de `window.electron` para comunicarse con el proceso principal.
- **Decisión**: Crear un archivo `src/test/setupRenderer.ts` que mockee globalmente las APIs de Electron expuestas.

### 3. Estrategia de Mocks para Componentes Complejos
El editor Monaco (`monaco-editor`) es difícil de instanciar en entornos jsdom.
- **Decisión**: Mockear el componente `VueMonacoEditor` y cualquier dependencia pesada de UI, centrándose en probar la lógica de interacción y estado del componente padre.

### 4. Priorización
Se comenzará probando los **Stores (Pinia)** por ser lógica pura de negocio desacoplada de la UI, lo que dará victorias rápidas de cobertura. Luego se abordarán componentes pequeños y finalmente los más complejos.

## Risks / Trade-offs
- **Complejidad de Mocks**: Simular el entorno de Electron y Monaco puede ser propenso a errores y dar falsos positivos. Se mitiga manteniendo los mocks actualizados.
- **Tiempo de Implementación**: Escribir tests para una UI existente es lento. Se priorizará cobertura de lógica sobre cobertura de renderizado visual.
