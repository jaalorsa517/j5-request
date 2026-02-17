## 1. Setup y Dependencias

- [x] 1.1 Agregar dependencia `openapi-types` en `package.json` para validación de OpenAPI (si no está ya).
- [x] 1.2 Crear tipos TypeScript para los formatos de exportación en `src/types/export.ts` (enum `ExportFormat`, etc.).

## 2. Backend - ExportService

- [x] 2.1 Crear `src/main/services/ExportService.ts` con estructura base.
- [x] 2.2 Implementar generador `generateCurl(request: J5Request): string` con escaping correcto para shell.
- [x] 2.3 Implementar generador `generateFetch(request: J5Request): string` para código JavaScript.
- [x] 2.4 Implementar generador `generatePowerShell(request: J5Request): string` para código PowerShell.
- [x] 2.5 Implementar generador `generatePostmanCollection(requests: J5Request[]): object` para Postman v2.1.
- [x] 2.6 Implementar generador `generateInsomniaCollection(requests: J5Request[]): object` para Insomnia.
- [x] 2.7 Implementar generador `generateOpenAPI(requests: J5Request[], metadata: OpenAPIMetadata): object` para OpenAPI 3.x.
- [x] 2.8 Implementar método `exportToClipboard(content: string): Promise<void>` usando la API de portapapeles de Electron.
- [x] 2.9 Implementar método `exportToFile(content: string, filePath: string): Promise<void>` para guardar archivos.
- [x] 2.10 Exponer métodos de exportación en el preload script (`src/preload/index.ts`) bajo `window.electron.export`.

## 3. UI - Menú de Exportación

- [x] 3.1 Agregar menú contextual "Copiar como..." en `RequestPanel.vue` con submenú (cURL, Fetch, PowerShell).
- [x] 3.2 Implementar handler para "Copiar como cURL" que llame a `window.electron.export.toCurl(currentRequest)`.
- [x] 3.3 Implementar handler para "Copiar como Fetch".
- [x] 3.4 Implementar handler para "Copiar como PowerShell".
- [x] 3.5 Mostrar toast/notificación de confirmación después de copiar al portapapeles.

## 4. UI - Exportar Petición Individual (Archivo)

- [x] 4.1 Agregar opción "Exportar a archivo..." en el menú contextual de `RequestPanel.vue`.
- [x] 4.2 Crear componente `ExportDialog.vue` para seleccionar formato y opciones de exportación.
- [x] 4.3 Implementar lógica para abrir file picker nativo con extensión apropiada según el formato (.sh, .json, .yaml).
- [x] 4.4 Implementar handler para exportar un request individual a archivo.
- [x] 4.5 Mostrar confirmación con ubicación del archivo guardado.

## 5. Exportación Múltiple (Colecciones)

- [x] 5.1 Permitir selección múltiple en `FileTree.vue` (multi-select de archivos `.j5request`).
- [x] 5.2 Agregar opción "Exportar selección como..." en menú contextual del FileTree.
- [x] 5.3 Implementar lógica para leer múltiples archivos `.j5request` desde el filesystem.
- [x] 5.4 Implementar exportación de selección múltiple a Postman Collection.
- [x] 5.5 Implementar exportación de selección múltiple a Insomnia Collection.
- [x] 5.6 Implementar exportación de selección múltiple a OpenAPI con diálogo para metadata (title, version, server URL).

## 6. Validación de Output

- [x] 6.1 Implementar validación de escaping en `generateCurl()` para prevenir comandos inválidos.
- [x] 6.2 Implementar validación JSON para Postman/Insomnia usando `JSON.parse(JSON.stringify(...))`.
- [x] 6.3 Implementar validación de OpenAPI usando `openapi-types` para asegurar spec válido.

## 7. Manejo de Limitaciones

- [x] 7.1 Detectar cuando un request tiene scripts pre/post-request antes de exportar.
- [x] 7.2 Mostrar warning al usuario indicando que los scripts no serán incluidos en la exportación a cURL/Fetch/PowerShell.
- [x] 7.3 Para OpenAPI, agregar comentario en el spec indicando features no exportadas (scripts).

## 8. Testing

- [x] 8.1 Crear tests unitarios para `generateCurl()` con diferentes tipos de requests (GET, POST, headers, auth).
- [x] 8.2 Crear tests unitarios para `generateFetch()` y `generatePowerShell()`.
- [x] 8.3 Crear tests unitarios para `generatePostmanCollection()` verificando estructura JSON válida.
- [x] 8.4 Crear tests unitarios para `generateInsomniaCollection()`.
- [x] 8.5 Crear tests unitarios para `generateOpenAPI()` validando contra schema OpenAPI.
- [x] 8.6 Crear tests de integración para el flujo completo: request → exportación → validación del output.

## 9. Documentación

- [x] 9.1 Documentar formatos de exportación soportados en el README o docs de usuario.
- [x] 9.2 Documentar limitaciones conocidas (ej. scripts no exportables).
- [x] 9.3 Agregar ejemplos de uso de exportación en la documentación del proyecto.

## 10. Validación Manual

- [x] 10.1 Exportar un request como cURL y ejecutarlo en terminal para verificar que funciona.
- [x] 10.2 Exportar como Fetch, copiar en consola del navegador y verificar que es ejecutable.
- [x] 10.3 Exportar múltiples requests como Postman Collection e importar en Postman para validar.
- [x] 10.4 Exportar como OpenAPI y validar el spec en un validador online (ej. editor.swagger.io).
- [x] 10.5 Verificar que copiar al portapapeles funciona correctamente en el OS.
