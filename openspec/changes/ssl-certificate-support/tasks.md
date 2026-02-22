## 1. Tipos y Modelo de Datos

- [x] 1.1 Crear tipo `SSLConfig` en `src/shared/types.ts` con campos `ca`, `clientCert`, `clientKey`, `rejectUnauthorized`.
- [x] 1.2 Extender tipo `J5Request` para incluir campo opcional `sslConfig?: SSLConfig`.
- [x] 1.3 Crear tipo `ProjectConfig` en `src/shared/types.ts` con campo opcional `ssl?: SSLConfig`.

## 2. Validación de Certificados

- [x] 2.1 Crear módulo `src/main/utils/certificateValidator.ts`.
- [x] 2.2 Implementar `validatePEMFormat(filePath: string): Promise<boolean>` que verifique formato PEM válido.
- [x] 2.3 Implementar `certificateExists(filePath: string): Promise<boolean>` para validar existencia de archivo.
- [x] 2.4 Implementar `validateSSLConfig(config: SSLConfig, projectRoot: string): Promise<{valid: boolean, errors: string[]}>`.

## 3. Gestión de Rutas Relativas

- [x] 3.1 Crear utilidad `resolveRelativePath(relativePath: string, projectRoot: string): string` en utils.
- [x] 3.2 Crear utilidad `makeRelativePath(absolutePath: string, projectRoot: string): string` en utils.
- [x] 3.3 Implementar lógica para convertir rutas absolutas del file picker a relativas antes de guardar en `.j5request`.

## 4. Backend - RequestExecutor

- [x] 4.1 Modificar `RequestExecutor.execute()` para aceptar `sslConfig` como parámetro.
- [x] 4.2 Implementar función `loadSSLCertificates(config: SSLConfig, projectRoot: string): Promise<https.AgentOptions>`.
- [x] 4.3 Leer contenido de archivos CA usando `fs.readFile()` y convertir a array de strings.
- [x] 4.4 Leer client certificate y key si están configurados.
- [x] 4.5 Construir objeto `https.AgentOptions` con los certificados cargados.
- [x] 4.6 Pasar `AgentOptions` a axios config: `httpsAgent: new https.Agent(options)`.
- [x] 4.7 Agregar manejo de errores para archivos de certificados faltantes o inválidos.

## 5. Configuración de Proyecto (.j5project.json)

- [x] 5.1 Crear `ProjectConfigService.ts` en `src/main/services/`.
- [x] 5.2 Implementar `loadProjectConfig(projectRoot: string): Promise<ProjectConfig | null>`.
- [x] 5.3 Implementar `saveProjectConfig(projectRoot: string, config: ProjectConfig): Promise<void>`.
- [x] 5.4 Implementar merge logic: request SSL config override project SSL config.

## 6. IPC Layer

- [x] 6.1 Exponer método `window.electron.ssl.selectCertificateFile()` en preload script para abrir file picker.
- [x] 6.2 Implementar IPC handler para file picker que permita multi-select y filtros `.crt`, `.pem`, `.cer`.
- [x] 6.3 Modificar IPC de `executeRequest` para pasar `sslConfig` y `projectRoot` al RequestExecutor.
- [x] 6.4 Actualizar type definitions en `src/global.d.ts`.

## 7. UI - Sección SSL en RequestPanel

- [x] 7.1 Crear componente `SSLConfigPanel.vue` en `src/renderer/components/`.
- [x] 7.2 Agregar sección/tab "SSL/TLS" en `RequestPanel.vue` o `RequestEditor.vue`.
- [x] 7.3 Implementar UI para agregar/remover CA certificates (lista con botones + / - ).
- [x] 7.4 Implementar file pickers para Client Certificate y Client Key.
- [x] 7.5 Implementar toggle "Disable SSL Verification" con estilo de advertencia (rojo).
- [x] 7.6 Mostrar banner de advertencia permanente cuando `rejectUnauthorized: false`.
- [x] 7.7 Integrar `SSLConfigPanel` en el flujo de edición de requests.

## 8. Store - Request Store

- [x] 8.1 Extender `useRequestStore` para incluir campo `sslConfig` en el request activo.
- [x] 8.2 Implementar método `updateSSLConfig(config: SSLConfig)` para actualizar configuración.
- [x] 8.3 Asegurar que `sslConfig` se guarda/carga correctamente desde archivos `.j5request`.

## 9. Validación de Certificados Fuera del Proyecto

- [x] 9.1 Detectar cuando un certificado seleccionado está fuera de la carpeta del proyecto.
- [x] 9.2 Mostrar diálogo sugiriendo copiar el archivo a `.j5certs/` para portabilidad.
- [x] 9.3 Implementar lógica para copiar automáticamente si el usuario acepta.

## 10. Advertencias de Seguridad

- [x] 10.1 Implementar banner rojo permanente en RequestPanel cuando `rejectUnauthorized: false`.
- [x] 10.2 Agregar tooltip/mensaje explicando por qué es inseguro.
- [x] 10.3 Al exportar a cURL/otros formatos, incluir comentario de advertencia si SSL verification está deshabilitada.

## 11. Testing

- [x] 11.1 Crear tests unitarios para `validatePEMFormat()` con certificados válidos e inválidos.
- [x] 11.2 Crear tests unitarios para `loadSSLCertificates()` verificando correcta construcción de `https.AgentOptions`.
- [ ] 11.3 Crear test de integración ejecutando request contra servidor con certificado auto-firmado usando CA personalizada.
- [ ] 11.4 Crear test verificando que mTLS funciona (requiere setup de servidor mTLS mock).
- [x] 11.5 Crear test verificando merge de project-level y request-level SSL config.
- [ ] 11.6 Crear test de UI para `SSLConfigPanel` verificando agregado/remoción de certificados.

## 12. Documentación

- [ ] 12.1 Documentar estructura de `.j5project.json` en README o docs.
- [ ] 12.2 Documentar formato de `sslConfig` en archivos `.j5request`.
- [ ] 12.3 Agregar guía de uso: cómo configurar CA personalizada, mTLS, etc.
- [ ] 12.4 Documentar conversión de formatos no-PEM usando OpenSSL (ej. `.p12` → `.pem`).
- [ ] 12.5 Documentar riesgos de `rejectUnauthorized: false` y cuándo es apropiado usarlo.

## 13. Validación Manual

- [x] 13.1 Configurar CA personalizada para servidor local con certificado auto-firmado y verificar que el request funciona.
- [x] 13.2 Configurar cliente mTLS con certificado y llave, ejecutar request contra servidor que requiere mTLS.
- [x] 13.3 Deshabilitar verificación SSL y verificar que aparece advertencia en UI.
- [x] 13.4 Verificar que configuración de proyecto (`.j5project.json`) se aplica a todos los requests del proyecto.
- [x] 13.5 Verificar que request-level SSL config override project-level config correctamente.
- [x] 13.6 Intentar usar certificado inválido/corrupto y verificar que muestra error claro.
