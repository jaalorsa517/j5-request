## 1. Setup y Dependencias

- [x] 1.1 Agregar dependencia `curlconverter` en `package.json` para parsing de cURL.
- [x] 1.2 Agregar dependencia `openapi-types` (o similar) para validación de OpenAPI.
- [x] 1.3 Agregar dependencia `js-yaml` para parsear archivos OpenAPI en YAML.
- [x] 1.4 Crear tipos TypeScript para el modelo intermedio `ParsedRequest` en `src/types/import.ts`.



## 2. Backend - ImportService

- [x] 2.1 Crear `src/main/services/ImportService.ts` con estructura base.
- [x] 2.2 Implementar método `detectFormat(content: string): ImportFormat | null` para detección automática.
- [x] 2.3 Implementar parser `parseCurl(curlCommand: string): ParsedRequest` usando `curlconverter`.
- [x] 2.4 Implementar parser `parseOpenAPI(spec: object): ParsedRequest[]` para OpenAPI 3.x.
- [x] 2.5 Implementar parser `parsePostman(collection: object): ParsedRequest[]` para Postman v2.1.
- [x] 2.6 Implementar parser `parseInsomnia(collection: object): ParsedRequest[]` para Insomnia.
- [x] 2.7 Implementar parser `parseFetch(code: string): ParsedRequest` para JavaScript fetch.
- [x] 2.8 Implementar parser `parsePowerShell(code: string): ParsedRequest` para Invoke-WebRequest.
- [x] 2.9 Implementar método `convertToJ5Request(parsed: ParsedRequest): J5Request` para transformar modelo intermedio a formato nativo.
- [x] 2.10 Exponer métodos de importación en el preload script (`src/preload/index.ts`) bajo `window.electron.import`.


## 3. UI - Diálogo de Importación

- [x] 3.1 Crear componente `ImportModal.vue` con estructura de tabs (Portapapeles / Archivo).
- [x] 3.2 Implementar tab "Pegar" con textarea y botón "Importar".
- [x] 3.3 Implementar tab "Archivo" con file picker y botón "Importar".
- [x] 3.4 Agregar selector manual de formato (dropdown) para casos de detección fallida.
- [x] 3.5 Mostrar formato detectado automáticamente en la UI.
- [x] 3.6 Implementar lógica de llamada a `window.electron.import.fromClipboard(content, format?)`.
- [x] 3.7 Implementar lógica de llamada to `window.electron.import.fromFile(filePath, format?)`.
- [x] 3.8 Mostrar progreso durante la importación (especialmente para OpenAPI con múltiples endpoints).
- [x] 3.9 Mostrar mensajes de error claros cuando falla el parsing o conversión.
- [x] 3.10 Integrar `ImportModal` en `MainLayout.vue` con botón/menú de acceso.

## 4. Generación de Archivos

- [x] 4.1 Implementar lógica para generar nombres de archivo únicos desde ParsedRequest (ej. `{method}-{path}.j5request`).
- [x] 4.2 Crear método en `FileSystemService` para guardar múltiples `.j5request` en batch (para colecciones/OpenAPI).
- [x] 4.3 Verificar que los archivos generados se muestren automáticamente en el FileTree después de importar.

## 5. Validación y Manejo de Errores

- [x] 5.1 Implementar validación de formato en cada parser antes de la conversión.
- [x] 5.2 Crear mensajes de error descriptivos para cada tipo de fallo.
- [x] 5.3 Agregar try-catch en todos los parsers para evitar crashes.

## 6. Testing

- [x] 6.1 Escribir tests unitarios para `ImportService` (todos los parsers).
- [x] 6.2 Escribir tests para `FileSystemService.saveRequests`.
- [x] 6.3 Validar integración backend-frontend (IPC).
- [x] 6.4 Probar importación de archivos grandes (> 5MB).
- [x] 6.5 Probar importación de archivos corruptos o mal formados.
- [x] 6.6 Validar que los caracteres especiales se preserven.

## 7. Documentación

- [x] 7.1 Documentar formatos soportados en el README o en docs de usuario.
- [x] 7.2 Documentar limitaciones conocidas (ej. scripts de Postman no soportados).
- [x] 7.3 Agregar ejemplos de importación en la documentación del proyecto.

## 8. Validación Manual

- [x] 8.1 Importar un comando cURL simple y verificar que se crea el archivo `.j5request` correcto.
- [x] 8.2 Importar una colección de Postman con varios requests y verificar generación múltiple.
- [x] 8.3 Importar un archivo OpenAPI con múltiples endpoints y verificar generación.
- [x] 8.4 Probar importación desde portapapeles pegando código fetch.
- [x] 8.5 Probar manejo de errores con un archivo corrupto o formato inválido.
