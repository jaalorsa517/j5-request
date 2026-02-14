# Tareas de Implementación

## 1. Configuración de Entorno Renderer

- [x] 1.1 Instalar dependencias necesarias: `jsdom` (o `happy-dom`) y `@vue/test-utils`.
- [x] 1.2 Configurar `vitest.config.ts` para usar el environment `jsdom` en archivos de prueba dentro de `src/renderer`.
- [x] 1.3 Crear archivo de setup `src/test/setupRenderer.ts` para inicializar mocks globales (Electron, LocalStorage).

## 2. Pruebas de Pinia Stores

- [ ] 2.1 Identificar stores existentes en `src/renderer/stores` (environment.ts, file-system.ts, git.ts, request.ts, system.ts).
- [x] 2.2 Crear pruebas unitarias para cada store, verificando estado inicial, acciones y getters.
- [x] 2.3 Asegurar que las dependencias externas de los stores estén correctamente mockeadas.

## 3. Pruebas de Componentes Vue (Iteración 1)

- [x] 3.1 Identificar componentes "hoja" (sin dependencias complejas) en `src/renderer/components` (HelloWorld.vue, EnvironmentSelector.vue, UrlBar.vue, KeyValueEditor.vue).
- [x] 3.2 Implementar pruebas de montaje y renderizado básico para estos componentes.
- [x] 3.3 Verificar interacción simple (clicks, emits).

## 4. Pruebas de Componentes Complejos (Mocking)

- [x] 4.1 Crear mock para `monaco-editor` o el componente wrapper que se esté usando.
- [x] 4.2 Implementar pruebas para los componentes que usan el editor, verificando que se integran con el store o emiten eventos correctamente, sin intentar renderizar el editor real.

## 5. Validación de Cobertura

- [x] 5.1 Ejecutar `pnpm run test:coverage`.
- [x] 5.2 Verificar aumento en métricas de cobertura global.
- [x] 5.3 Confirmar que el CI pasa si se alcanza el 90% (o ajustar estrategia si se está cerca).
