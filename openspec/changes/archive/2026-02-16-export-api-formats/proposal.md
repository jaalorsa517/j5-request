## Why

La aplicación permite a los usuarios crear y ejecutar requests HTTP almacenados en formato `.j5request`. Sin embargo, hay múltiples escenarios donde los usuarios necesitan compartir o reutilizar estos requests fuera de la aplicación:

- **Colaboración**: Compartir un request específico con compañeros que usan otras herramientas (Postman, Insomnia).
- **Documentación**: Incluir ejemplos de requests en documentación técnica (cURL es el estándar de facto).
- **Integración en código**: Copiar un request como código Fetch o PowerShell para integrarlo en scripts o aplicaciones.
- **Migración**: Exportar colecciones completas a OpenAPI para publicarlas o importarlas en otras plataformas.

Sin capacidad de exportación, los usuarios quedan "atrapados" en la aplicación y deben recrear manualmente sus requests en otros formatos, lo cual es tedioso y propenso a errores.

La exportación es la contrapartida necesaria de la importación para lograr interoperabilidad completa con el ecosistema de herramientas de desarrollo de APIs.

## What Changes

Se agregará una capacidad de exportación que permite convertir requests desde el formato nativo `.j5request` hacia múltiples formatos estándar de la industria.

**Formatos de exportación soportados inicialmente:**
- **cURL**: Comando shell ejecutable.
- **JavaScript Fetch**: Código listo para copiar en aplicaciones web.
- **PowerShell Invoke-WebRequest**: Código para scripts de PowerShell.
- **Postman Collection v2.1**: JSON importable en Postman.
- **Insomnia Collection**: JSON importable en Insomnia.
- **OpenAPI 3.x**: Especificación estándar (desde múltiples requests).

**Destinos de exportación:**
- **Portapapeles**: Copiar el formato exportado directamente para pegar en otro lugar.
- **Archivo**: Guardar la exportación como archivo (ej. `.sh`, `.json`, `.yaml`).

**Arquitectura:**
- Un módulo exportador desacoplado de la lógica principal.
- Transformación desde `.j5request` a cada formato target.
- Generación de colecciones cuando se exportan múltiples requests (Postman/Insomnia/OpenAPI).

## Capabilities

### New Capabilities

- `api-export`: Capacidad para exportar requests desde el formato nativo de la aplicación hacia múltiples formatos externos (cURL, OpenAPI, Postman, Fetch, PowerShell, Insomnia), soportando tanto portapapeles como archivos como destinos de salida.

### Modified Capabilities

<!-- Sin modificaciones a capacidades existentes -->

## Impact

- **UI Components**: Se necesitará un menú contextual o botón de exportación en la UI (en el RequestPanel o barra de herramientas).
- **Backend/Services**: Nuevo módulo `ExportService` en el proceso main para generar cada formato desde `.j5request`.
- **Dependencies**: Posibles nuevas dependencias para facilitar la generación de formatos complejos (ej. OpenAPI schema builders).
- **Clipboard API**: Uso de la API del portapapeles de Electron para copiar contenido exportado.
- **User Experience**: Se requiere feedback claro después de exportar (confirmación de copia al portapapeles, ubicación del archivo guardado).
