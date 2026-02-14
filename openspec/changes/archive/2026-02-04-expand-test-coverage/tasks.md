# Tareas de Implementación

## 1. Expansión de Cobertura en Configuración

- [x] 1.1 Modificar `vitest.config.ts` para cambiar el patrón `include` de cobertura a `['src/**']`.
- [x] 1.2 Actualizar la lista de exclusiones (`exclude`) en `vitest.config.ts` para ignorar:
    - Archivos de configuración (`*.config.*`)
    - Definiciones de tipos (`**/*.d.ts`)
    - Puntos de entrada (`src/main/main.ts`, `src/renderer/main.ts`)
    - Preload scripts si no tienen lógica (`src/preload/**`)
    - Assets (`src/renderer/assets/**`)
- [x] 1.3 Verificar que el script `test:coverage` se ejecuta correctamente y genera un reporte que incluye archivos de `src/renderer` y otras áreas previamente ignoradas.

## 2. Validación de Estado

- [x] 2.1 Ejecutar el comando de cobertura y confirmar que el reporte muestra los nuevos archivos (probablemente con 0% de cobertura).
- [x] 2.2 Confirmar que el proceso falla debido a los umbrales del 90% (esto es el comportamiento esperado).
- [x] 2.3 Documentar los módulos principales con 0% de cobertura para futuros esfuerzos de mejora de pruebas (opcional, como nota en el PR o log).
