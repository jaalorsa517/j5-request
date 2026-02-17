## Why

Actualmente, la aplicación solo permite crear requests manualmente desde cero. Los usuarios que ya tienen requests definidos en otros formatos (cURL, Postman, Insomnia, OpenAPI, etc.) no pueden traer ese trabajo existente a la aplicación sin reescribir todo manualmente.

Este es un bloqueador crítico para la adopción de la aplicación porque:
- Los equipos ya tienen colecciones de requests en otras herramientas.
- Los desarrolladores copian comandos cURL de documentación y logs.
- Las APIs modernas publican especificaciones OpenAPI que deberían poder importarse.

Sin importación, la aplicación solo es útil para workflows completamente nuevos, limitando significativamente su valor.

## What Changes

Se agregará una capacidad de importación que permite convertir requests desde múltiples formatos estándar al formato nativo `.j5request` de la aplicación.

**Formatos soportados inicialmente:**
- cURL (comando shell)
- JavaScript Fetch
- PowerShell Invoke-WebRequest
- Postman Collection (JSON)
- Insomnia Collection (JSON)
- OpenAPI 3.x Specification (JSON/YAML)

**Fuentes de importación:**
- Desde el portapapeles (pegar y convertir)
- Desde archivos (abrir archivo y convertir)

**Arquitectura:**
- Un módulo convertidor desacoplado de la lógica principal de la aplicación.
- Parsing y validación independientes por formato.
- Transformación a un modelo intermedio antes de generar `.j5request`.

## Capabilities

### New Capabilities

- `api-import`: Capacidad para importar requests desde múltiples formatos externos (cURL, OpenAPI, Postman, etc.) hacia el formato nativo de la aplicación, soportando tanto portapapeles como archivos como fuentes de entrada.

### Modified Capabilities

<!-- Sin modificaciones a capacidades existentes -->

## Impact

- **UI Components**: Se necesitará un nuevo flujo de importación accesible desde el menú o la barra de herramientas.
- **Backend/Services**: Nuevo módulo `ImportService` o similar en el proceso main para parsear y transformar formatos.
- **Dependencies**: Posibles nuevas dependencias para parsear formatos específicos (ej. librerías para OpenAPI, Postman schemas).
- **File System**: Extensión del flujo de creación de archivos `.j5request` para soportar importación masiva.
- **User Experience**: Se requiere retroalimentación clara cuando la importación falla (formato no reconocido, sintaxis inválida, etc.).
