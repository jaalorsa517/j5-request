## 1. Setup y Dependencias

- [ ] 1.1 Agregar dependencia `curlconverter` en `package.json` para parsing de cURL.
- [ ] 1.2 Agregar dependencia `openapi-types` (o similar) para validación de OpenAPI.
- [ ] 1.3 Agregar dependencia `js-yaml` para parsear archivos OpenAPI en YAML.
- [ ] 1.4 Crear tipos TypeScript para el modelo intermedio `ParsedRequest` en `src/types/import.ts`.

## 2. Backend - ImportService

- [ ] 2.1 Crear `src/main/services/ImportService.ts` con estructura base.
- [ ] 2.2 Implementar método `detectFormat(content: string): ImportFormat | null` para detección automática.
- [ ] 2.3 Implementar parser `parseCurl(curlCommand: string): ParsedRequest` usando `curlconverter`.
- [ ] 2.4 Implementar parser `parseOpenAPI(spec: object): ParsedRequest[]` para OpenAPI 3.x.
- [ ] 2.5 Implementar parser `parsePostman(collection: object): ParsedRequest[]` para Postman v2.1.
- [ ] 2.6 Implementar parser `parseInsomnia(collection: object): ParsedRequest[]` para Insomnia.
- [ ] 2.7 Implementar parser `parseFetch(code: string): ParsedRequest` para JavaScript fetch.
- [ ] 2.8 Implementar parser `parsePowerShell(code: string): ParsedRequest` para Invoke-WebRequest.
- [ ] 2.9 Implementar método `convertToJ5Request(parsed: ParsedRequest): J5Request` para transformar modelo intermedio a formato nativo.
- [ ] 2.10 Exponer métodos de importación en el preload script (`src/preload/index.ts`) bajo `window.electron.import`.

## 3. UI - Diálogo de Importación

- [ ] 3.1 Crear componente `ImportModal.vue` con estructura de tabs (Portapapeles / Archivo).
- [ ] 3.2 Implementar tab "Pegar" con textarea y botón "Importar".
- [ ] 3.3 Implementar tab "Archivo" con file picker y botón "Importar".
- [ ] 3.4 Agregar selector manual de formato (dropdown) para casos de detección fallida.
- [ ] 3.5 Mostrar formato detectado automáticamente en la UI.
- [ ] 3.6 Implementar lógica de llamada a `window.electron.import.fromClipboard(content, format?)`.
- [ ] 3.7 Implementar lógica de llamada a `window.electron.import.fromFile(filePath, format?)`.
- [ ] 3.8 Mostrar progreso durante la importación (especialmente para OpenAPI con múltiples endpoints).
- [ ] 3.9 Mostrar mensajes de error claros cuando falla el parsing o conversión.
- [ ] 3.10 Integrar `ImportModal` en `MainLayout.vue` con botón/menú de acceso.

## 4. Generación de Archivos

- [ ] 4.1 Implementar lógica para generar nombres de archivo únicos desde ParsedRequest (ej. `{method}-{path}.j5request`).
- [ ] 4.2 Crear método en `FileSystemService` para guardar múltiples `.j5request` en batch (para colecciones/OpenAPI).
- [ ] 4.3 Verificar que los archivos generados se muestren automáticamente en el FileTree después de importar.

## 5. Validación y Manejo de Errores

- [ ] 5.1 Implementar validación de formato en cada parser antes de la conversión.
- [ ] 5.2 Crear mensajes de error descriptivos para cada tipo de fallo (formato inválido, archivo corrupto, etc.).
- [ ] 5.3 Agregar try-catch en todos los parsers para evitar crashes.

## 6. Testing

- [ ] 6.1 Crear tests unitarios para `detectFormat()` con ejemplos de cada formato.
- [ ] 6.2 Crear tests unitarios para `parseCurl()` con comandos cURL variados (GET, POST, headers, auth).
- [ ] 6.3 Crear tests unitarios para `parseOpenAPI()` con specs de ejemplo.
- [ ] 6.4 Crear tests unitarios para `parsePostman()` con colecciones de ejemplo.
- [ ] 6.5 Crear tests unitarios para `parseFetch()` y `parsePowerShell()`.
- [ ] 6.6 Crear tests de integración para el flujo completo: input → parsing → conversión → archivo generado.

## 7. Documentación

- [ ] 7.1 Documentar formatos soportados en el README o en docs de usuario.
- [ ] 7.2 Documentar limitaciones conocidas (ej. scripts de Postman no soportados).
- [ ] 7.3 Agregar ejemplos de importación en la documentación del proyecto.

## 8. Validación Manual

- [ ] 8.1 Importar un comando cURL simple y verificar que se crea el archivo `.j5request` correcto.
- [ ] 8.2 Importar una colección de Postman con varios requests y verificar generación múltiple.
- [ ] 8.3 Importar un archivo OpenAPI con múltiples endpoints y verificar generación.
- [ ] 8.4 Probar importación desde portapapeles pegando código fetch.
- [ ] 8.5 Probar manejo de errores con un archivo corrupto o formato inválido.
