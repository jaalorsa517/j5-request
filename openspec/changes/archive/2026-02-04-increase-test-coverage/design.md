# Diseño: Cobertura de Pruebas y Calidad de Código

## Contexto
El proyecto cuenta con una infraestructura básica de pruebas unitarias utilizando Vitest. Sin embargo, no existe visibilidad sobre qué porcentaje del código está cubierto por estas pruebas, ni mecanismos para asegurar que el nuevo código mantenga o mejore la calidad existente. El objetivo es configurar la recolección de métricas de cobertura y establecer un estándar de calidad alto (>90%).

## Objetivos / No Objetivos

**Objetivos:**
- Configurar Vitest para recolectar métricas de cobertura de código.
- Establecer umbrales de cobertura mínimos del 90% para líneas, ramas, funciones y sentencias.
- Generar reportes de cobertura en formatos legibles (HTML para humanos, JSON/Text para máquinas/CI).
- Asegurar que la ejecución de pruebas falle si no se cumplen los umbrales de cobertura.
- Identificar áreas de bajo cubrimiento y planificar su mejora (como parte de la implementación de este cambio).

**No Objetivos:**
- Migrar a otro framework de pruebas (seguiremos usando Vitest).
- Implementar pruebas de integración complejas o E2E en esta fase (foco en unitarias).

## Decisiones

### Proveedor de Cobertura
Se utilizará **v8** como proveedor de cobertura por su rendimiento y integración nativa con Vitest.

### Umbrales de Cobertura
Se definirán los siguientes umbrales en la configuración de Vitest:
- **Líneas**: 90%
- **Funciones**: 90%
- **Ramas**: 90%
- **Sentencias**: 90%

### Reportes
Los reportes se generarán en la carpeta `coverage/` y se incluirán en el `.gitignore`.

### Archivos Excluidos
Se excluirán del análisis de cobertura:
- Archivos de distribución (`dist/`, `build/`)
- Mocks y fixtures de prueba
- Archivos de definición de tipos (`*.d.ts`)
- Archivos de configuración (`vite.config.ts`, `vitest.config.ts`, etc.)

## Riesgos / Trade-offs

**Riesgos:**
- Es posible que la cobertura actual sea muy baja, lo que hará que los pipelines fallen inmediatamente.
- **Mitigación**: Se realizará una ejecución inicial para evaluar el estado actual. Si es muy bajo, se podrían ajustar los umbrales temporalmente o planificar un sprint de escritura de tests antes de activar el fallo automático, o excluir módulos legacy si es necesario. Dado el requerimiento explícito de "subir al 90%", se asume el esfuerzo de escribir los tests faltantes.

**Trade-offs:**
- La ejecución de pruebas con cobertura es ligeramente más lenta que la ejecución normal. Se mantendrá un script `test` rápido (sin cobertura por defecto o opcional) y un `test:coverage` para validación completa.
