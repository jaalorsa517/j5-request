## Context

La aplicación actualmente no tiene un sistema de importación. Los requests se crean manualmente desde la UI.

Los formatos de importación más comunes en el ecosistema son:
- **cURL**: Comando shell universal usado en documentación.
- **Postman/Insomnia Collections**: Formatos JSON propietarios pero ampliamente usados.
- **OpenAPI**: Especificación estándar para describir APIs REST completas.
- **JavaScript Fetch/PowerShell**: Snippets de código generados por navegadores y herramientas.

Cada formato tiene su propia estructura y complejidad. OpenAPI puede describir múltiples endpoints, mientras que cURL describe una sola request.

## Goals / Non-Goals

**Goals:**
- Importar requests individuales desde cURL, Fetch, PowerShell.
- Importar colecciones desde Postman, Insomnia, OpenAPI.
- Soportar entrada desde portapapeles y archivos.
- Convertir a formato `.j5request` nativo.
- Proveer retroalimentación clara de errores de parsing.

**Non-Goals:**
- Exportar desde `.j5request` a otros formatos (fuera de scope).
- Soportar formatos propietarios raros o legacy (ej. SOAP/XML antiguo).
- Importar configuración avanzada de Postman (scripts pre-request, auth flows complejos) en la primera versión.
- Sincronización en tiempo real con herramientas externas.

## Decisions

### 1. Arquitectura de Conversión
- **Decisión**: Patrón Strategy con un parser por formato.
- **Alternativa considerada**: Biblioteca de terceros única (ej. `curlconverter`). Rechazada porque no cubre todos los formatos necesarios.
- **Razón**: Permite agregar formatos incrementalmente y testear cada uno aisladamente.

### 2. Modelo Intermedio
- **Decisión**: Convertir todos los formatos a un tipo intermedio `ParsedRequest` antes de generar `.j5request`.
- **Razón**: Desacopla el parsing del formato destino, facilitando futuras exportaciones.

### 3. Ubicación del Módulo
- **Decisión**: Crear `src/main/services/ImportService.ts` en el proceso main.
- **Alternativa considerada**: Worker thread separado. Rechazada por complejidad innecesaria para el MVP.
- **Razón**: El parsing síncrono de archivos pequeños no bloqueará la UI.

### 4. Dependencias Externas
- **Decisión**: Usar bibliotecas especializadas cuando sea práctico:
  - `curlconverter` para cURL → HTTP request.
  - `openapi-types` para validación de OpenAPI.
  - Parsing manual para Postman/Insomnia (son JSON simples).
- **Razón**: No reinventar la rueda para formatos complejos como cURL.

### 5. UI de Importación
- **Decisión**: Diálogo modal con:
  - Tab 1: "Pegar" (textarea para portapapeles).
  - Tab 2: "Archivo" (file picker).
  - Detección automática de formato o selector manual.
- **Razón**: Simple e intuitivo, similar a Postman.

### 6. Manejo de Múltiples Requests (OpenAPI, Colecciones)
- **Decisión**: Generar un archivo `.j5request` por endpoint encontrado, guardándolos en la carpeta actual con nombres derivados del path/método.
- **Razón**: Mantiene el modelo de "un archivo = un request" consistente.

## Risks / Trade-offs

- **Risk**: Parsing de cURL es notoriamente complejo (escaping, shell variations).
  - **Mitigation**: Usar `curlconverter` (biblioteca probada) en lugar de regex manual.

- **Risk**: Schemas de Postman/Insomnia pueden cambiar entre versiones.
  - **Mitigation**: Soportar solo versiones recientes (v2.1 para Postman). Documentar incompatibilidades conocidas.

- **Risk**: OpenAPI puede ser muy grande (100s de endpoints).
  - **Mitigation**: Limitar a 100 requests por importación. Mostrar progreso durante la conversión.

- **Risk**: Información perdida en la conversión (ej. scripts de Postman).
  - **Mitigation**: Documentar limitaciones en la UI. Futura mejora: preservar scripts en el scripting engine de la app.

## Open Questions

- ¿Debería haber una preview antes de guardar los archivos importados?
  - **Decisión pendiente**: Evaluar si agrega complejidad innecesaria para el MVP.
