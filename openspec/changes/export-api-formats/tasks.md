## 1. Setup y Dependencias

- [ ] 1.1 Agregar dependencia `openapi-types` en `package.json` para validación de OpenAPI (si no está ya).
- [ ] 1.2 Crear tipos TypeScript para los formatos de exportación en `src/types/export.ts` (enum `ExportFormat`, etc.).

## 2. Backend - ExportService

- [ ] 2.1 Crear `src/main/services/ExportService.ts` con estructura base.
- [ ] 2.2 Implementar generador `generateCurl(request: J5Request): string` con escaping correcto para shell.
- [ ] 2.3 Implementar generador `generateFetch(request: J5Request): string` para código JavaScript.
- [ ] 2.4 Implementar generador `generatePowerShell(request: J5Request): string` para código PowerShell.
- [ ] 2.5 Implementar generador `generatePostmanCollection(requests: J5Request[]): object` para Postman v2.1.
- [ ] 2.6 Implementar generador `generateInsomniaCollection(requests: J5Request[]): object` para Insomnia.
- [ ] 2.7 Implementar generador `generateOpenAPI(requests: J5Request[], metadata: OpenAPIMetadata): object` para OpenAPI 3.x.
- [ ] 2.8 Implementar método `exportToClipboard(content: string): Promise<void>` usando la API de portapapeles de Electron.
- [ ] 2.9 Implementar método `exportToFile(content: string, filePath: string): Promise<void>` para guardar archivos.
- [ ] 2.10 Exponer métodos de exportación en el preload script (`src/preload/index.ts`) bajo `window.electron.export`.

## 3. UI - Menú de Exportación

- [ ] 3.1 Agregar menú contextual "Copiar como..." en `RequestPanel.vue` con submenú (cURL, Fetch, PowerShell).
- [ ] 3.2 Implementar handler para "Copiar como cURL" que llame a `window.electron.export.toCurl(currentRequest)`.
- [ ] 3.3 Implementar handler para "Copiar como Fetch" que llame a `window.electron.export.toFetch(currentRequest)`.
- [ ] 3.4 Implementar handler para "Copiar como PowerShell" que llame a `window.electron.export.toPowerShell(currentRequest)`.
- [ ] 3.5 Mostrar toast/notificación de confirmación después de copiar al portapapeles.

## 4. UI - Exportación a Archivo

- [ ] 4.1 Agregar opción "Exportar a archivo..." en menú/toolbar de RequestPanel.
- [ ] 4.2 Crear componente `ExportDialog.vue` para seleccionar formato y opciones de exportación.
- [ ] 4.3 Implementar lógica para abrir file picker nativo con extensión apropiada según el formato (.sh, .json, .yaml).
- [ ] 4.4 Implementar handler para exportar un request individual a archivo.
- [ ] 4.5 Mostrar confirmación con ubicación del archivo guardado.

## 5. Exportación Múltiple (Colecciones)

- [ ] 5.1 Permitir selección múltiple en `FileTree.vue` (multi-select de archivos `.j5request`).
- [ ] 5.2 Agregar opción "Exportar selección como..." en menú contextual del FileTree.
- [ ] 5.3 Implementar lógica para leer múltiples archivos `.j5request` desde el filesystem.
- [ ] 5.4 Implementar exportación de selección múltiple a Postman Collection.
- [ ] 5.5 Implementar exportación de selección múltiple a Insomnia Collection.
- [ ] 5.6 Implementar exportación de selección múltiple a OpenAPI con diálogo para metadata (title, version, server URL).

## 6. Validación de Output

- [ ] 6.1 Implementar validación de escaping en `generateCurl()` para prevenir comandos inválidos.
- [ ] 6.2 Implementar validación JSON para Postman/Insomnia usando `JSON.parse(JSON.stringify(...))`.
- [ ] 6.3 Implementar validación de OpenAPI usando `openapi-types` para asegurar spec válido.

## 7. Manejo de Limitaciones

- [ ] 7.1 Detectar cuando un request tiene scripts pre/post-request antes de exportar.
- [ ] 7.2 Mostrar warning al usuario indicando que los scripts no serán incluidos en la exportación a cURL/Fetch/PowerShell.
- [ ] 7.3 Para OpenAPI, agregar comentario en el spec indicando features no exportadas (scripts).

## 8. Testing

- [ ] 8.1 Crear tests unitarios para `generateCurl()` con diferentes tipos de requests (GET, POST, headers, auth).
- [ ] 8.2 Crear tests unitarios para `generateFetch()` y `generatePowerShell()`.
- [ ] 8.3 Crear tests unitarios para `generatePostmanCollection()` verificando estructura JSON válida.
- [ ] 8.4 Crear tests unitarios para `generateInsomniaCollection()`.
- [ ] 8.5 Crear tests unitarios para `generateOpenAPI()` validando contra schema OpenAPI.
- [ ] 8.6 Crear tests de integración para el flujo completo: request → exportación → validación del output.

## 9. Documentación

- [ ] 9.1 Documentar formatos de exportación soportados en el README o docs de usuario.
- [ ] 9.2 Documentar limitaciones conocidas (ej. scripts no exportables).
- [ ] 9.3 Agregar ejemplos de uso de exportación en la documentación del proyecto.

## 10. Validación Manual

- [ ] 10.1 Exportar un request como cURL y ejecutarlo en terminal para verificar que funciona.
- [ ] 10.2 Exportar como Fetch, copiar en consola del navegador y verificar que es ejecutable.
- [ ] 10.3 Exportar múltiples requests como Postman Collection e importar en Postman para validar.
- [ ] 10.4 Exportar como OpenAPI y validar el spec en un validador online (ej. editor.swagger.io).
- [ ] 10.5 Verificar que copiar al portapapeles funciona correctamente en el OS.
