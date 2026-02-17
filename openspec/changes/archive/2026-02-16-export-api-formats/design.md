## Context

La aplicación almacena requests en formato JSON `.j5request` con una estructura específica que incluye método, URL, headers, body y configuración de scripting. 

Para exportar a otros formatos, necesitamos convertir este modelo interno a las estructuras y sintaxis esperadas por cada formato target. Cada formato tiene sus propias características:
- **cURL**: Sintaxis de comando shell con escaping adecuado.
- **Fetch/PowerShell**: Código sintácticamente válido en el lenguaje correspondiente.
- **Postman/Insomnia**: Schemas JSON específicos con metadatos adicionales.
- **OpenAPI**: Especificación declarativa que describe múltiples endpoints.

La exportación es el inverso de la importación, pero con desafíos diferentes: debemos asegurar que el output sea válido y utilizable en el contexto target.

## Goals / Non-Goals

**Goals:**
- Exportar un request individual a cURL, Fetch, PowerShell.
- Exportar múltiples requests como colecciones de Postman, Insomnia u OpenAPI.
- Permitir copiar al portapapeles o guardar como archivo.
- Generar código/configuración sintácticamente válido.
- Soportar exportación desde el request actual o desde selección múltiple en FileTree.

**Non-Goals:**
- Importar desde otros formatos (ya cubierto en `import-api-formats`).
- Exportar configuración avanzada no representable en el formato target (ej. scripts complejos de la app a Postman).
- Sincronización bidireccional automática con herramientas externas.

## Decisions

### 1. Arquitectura de Exportadores
- **Decisión**: Patrón Strategy con un exportador por formato.
- **Razón**: Misma lógica que en la importación, permite extensibilidad y testing aislado.

### 2. API de Exportación
- **Decisión**: Dos métodos principales:
  - `exportToClipboard(requests: J5Request[], format: ExportFormat): Promise<void>`
  - `exportToFile(requests: J5Request[], format: ExportFormat, filePath: string): Promise<void>`
- **Razón**: Separar el destino (clipboard vs archivo) de la lógica de conversión simplifica el código.

### 3. Ubicación del Módulo
- **Decisión**: Crear `src/main/services/ExportService.ts` en el proceso main.
- **Razón**: Consistencia con `ImportService` y acceso directo al filesystem.

### 4. Generación de cURL
- **Decisión**: Construir el comando manualmente con escaping correcto para shell.
- **Alternativa considerada**: Usar biblioteca de terceros. Rechazada porque no hay una biblioteca estándar confiable para este propósito (son más comunes parsers que generadores).
- **Razón**: Generar cURL es más simple que parsearlo; control total sobre el formato.

### 5. Generación de OpenAPI
- **Decisión**: Usar `openapi-types` para estructura y validación, construir spec manualmente.
- **Razón**: OpenAPI es complejo pero bien documentado; una librería de validación asegura que generemos specs válidas.

### 6. UI de Exportación
- **Decisión**: Menú contextual en RequestPanel con opciones:
  - "Copiar como..." → submenu (cURL, Fetch, PowerShell)
  - "Exportar a archivo..." → diálogo de selección de formato y ubicación
- **Razón**: Acceso rápido sin modal adicional para casos comunes (copiar como cURL).

### 7. Exportación Múltiple (Colecciones)
- **Decisión**: Permitir selección múltiple en FileTree y exportar como colección.
- **Razón**: Caso de uso importante para migración completa a otras herramientas.

## Risks / Trade-offs

- **Risk**: Pérdida de información en la conversión (ej. scripts pre/post-request no son representables en cURL).
  - **Mitigation**: Documentar limitaciones. Para OpenAPI, incluir comentarios indicando que hay scripts no exportados.

- **Risk**: Generación de código inválido si el request tiene valores extremos (ej. headers con comillas no escapadas).
  - **Mitigation**: Implementar escaping correcto para cada lenguaje. Agregar tests con casos extremos.

- **Risk**: OpenAPI generado desde múltiples requests podría tener conflictos de paths o falta de información de servidor.
  - **Mitigation**: Permitir al usuario especificar metadata básica (title, version, server URL) en un diálogo antes de exportar OpenAPI.

## Open Questions

- ¿Debería haber un preview del código generado antes de copiar/guardar?
  - **Decisión pendiente**: Evaluar si agrega valor. Para cURL sería útil ver el comando antes de copiarlo.
