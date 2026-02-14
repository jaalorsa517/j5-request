# Design: Expansión de Cobertura de Pruebas

## Context
Actualmente, la configuración de Vitest restringe la cobertura a `src/main/services`, lo que oculta la falta de pruebas en el frontend (Vue/Renderer) y otros módulos. El objetivo es reflejar la realidad del proyecto abarcando todo el código fuente.

## Goals / Non-Goals

**Goals:**
- Configurar Vitest para incluir **todos** los archivos en `src/` en el reporte de cobertura.
- Definir exclusiones precisas para archivos que no contienen lógica de negocio o son puntos de entrada de ejecución (ej. `main.ts`, archivos de declaración `.d.ts`).
- Mantener la ejecución de pruebas funcional, aunque los reportes de cobertura muestren valores bajos inicialmente.

**Non-Goals:**
- Implementar pruebas para todo el código descubierto en este cambio (eso es un esfuerzo continuo posterior).
- Refactorizar código existente para hacerlo testable (fuera del alcance de este cambio de configuración).

## Decisions

### 1. Inclusión Global "src/**"
Se cambiará el patrón de `include` de cobertura a `['src/**']`. Esto forzará al runner a evaluar todo el árbol de directorios.

### 2. Exclusiones Específicas
Se añadirán exclusiones para evitar ruido en los reportes:
- **Archivos de Configuración**: `vite.config.ts`, `vitest.config.ts`, `electron.vite.config.ts`.
- **Tipos TypeScript**: `**/*.d.ts`, `src/shared/types.ts` si solo contiene interfaces/tipos.
- **Puntos de Entrada**: `src/main/main.ts` (Entry point de Electron), `src/renderer/main.ts` (Entry point de Vue).
- **Archivos de Preload**: `src/preload/index.ts` (Suelen ser puentes de contexto simples, aunque idealmente deberían probarse, por ahora se pueden excluir si son puro boilerplate).
- **Archivos de Assets/Estilos**: `*.css`, `*.svg`, etc. (generalmente manejados por el bundler).

### 3. Manejo de Umbrales (Thresholds)
Dado que la base de código a cubrir aumentará drásticamente sin nuevas pruebas inmediatas, tenemos dos opciones:
1. **Bajar temporalmente los umbrales** para que CI no falle mientras se trabaja en la deuda técnica.
2. **Mantener los umbrales altos (90%)** y aceptar que el comando `test:coverage` fallará hasta que se alcance la cobertura.
   * **Decisión**: Mantendremos los umbrales altos como meta aspiracional, pero entenderemos que el build fallará. Esto visibiliza la deuda. El usuario ha pedido ver la realidad.

## Risks / Trade-offs
- **Riesgo**: La cobertura global caerá dramáticamente (probablemente <20%).
- **Trade-off**: Se sacrifica el "verde" del CI a corto plazo en favor de la transparencia total sobre la calidad del código.
