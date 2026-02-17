## 1. Módulo de Criptografía

- [ ] 1.1 Crear `src/main/services/CryptoService.ts` con estructura base.
- [ ] 1.2 Implementar `generateProjectKey(projectPath: string): Buffer` usando PBKDF2 con salt fijo derivado del path.
- [ ] 1.3 Implementar `encrypt(plaintext: string, key: Buffer): string` usando AES-256-GCM, retornando formato `ENC[AES256_GCM:iv:<hex>:data:<hex>:tag:<hex>]`.
- [ ] 1.4 Implementar `decrypt(encryptedValue: string, key: Buffer): string` que parsee el formato `ENC[...]` y desencripte.
- [ ] 1.5 Implementar `isEncrypted(value: string): boolean` para detectar formato `ENC[...]`.
- [ ] 1.6 Implementar `obfuscateKey(key: Buffer): string` para ofuscar llaves antes de almacenarlas.
- [ ] 1.7 Implementar `deobfuscateKey(obfuscated: string): Buffer` para recuperar llaves ofuscadas.

## 2. Gestión de Llaves en Globals

- [ ] 2.1 Extender la estructura de `globals.json` para incluir `_encryptionKeys: Record<string, string>`.
- [ ] 2.2 Modificar `EnvironmentManager` o crear método para leer llaves de encriptación desde globals.
- [ ] 2.3 Implementar método `getOrCreateProjectKey(projectPath: string): Buffer` que busque en globals o genere nueva llave.
- [ ] 2.4 Implementar método `saveProjectKey(projectPath: string, key: Buffer): Promise<void>` que guarde llave ofuscada en globals.
- [ ] 2.5 Agregar validación para prevenir sobrescritura accidental de llaves existentes.

## 3. Modificación de EnvironmentManager

- [ ] 3.1 Modificar `saveEnvironment()` para aceptar `projectPath` como parámetro adicional.
- [ ] 3.2 En `saveEnvironment()`, antes de serializar, iterar sobre variables y encriptar aquellas con `type: 'secret'`.
- [ ] 3.3 Verificar si el valor ya está encriptado (`isEncrypted()`) para evitar doble encriptación.
- [ ] 3.4 Modificar `loadEnvironment()` para aceptar `projectPath` como parámetro adicional.
- [ ] 3.5 En `loadEnvironment()`, después de parsear JSON, iterar sobre variables y desencriptar valores en formato `ENC[...]`.
- [ ] 3.6 Agregar manejo de errores para desencriptación fallida (llave incorrecta, valor corrupto).
- [ ] 3.7 Agregar lógica para NO encriptar si el environment es Globals (detectar si `filePath` es globalsPath).

## 4. Integración con Store (Frontend)

- [ ] 4.1 Modificar `useEnvironmentStore.loadEnvironmentFromFile()` para pasar el `projectPath` actual al backend.
- [ ] 4.2 Modificar `useEnvironmentStore.saveActiveEnvironment()` para pasar el `projectPath` actual al backend.
- [ ] 4.3 Obtener `projectPath` desde el workspace store o desde `window.electron.fs.getCurrentWorkspace()`.
- [ ] 4.4 Agregar detección de errors de desencriptación y mostrar mensaje claro al usuario.

## 5. IPC Layer

- [ ] 5.1 Modificar firma de IPC handler `loadEnvironment` para aceptar `projectPath: string`.
- [ ] 5.2 Modificar firma de IPC handler `saveEnvironment` para aceptar `projectPath: string`.
- [ ] 5.3 Actualizar type definitions en `src/global.d.ts` para reflejar nuevas firmas.
- [ ] 5.4 Actualizar preload script para pasar `projectPath` en las llamadas IPC.

## 6. Validación y Manejo de Errores

- [ ] 6.1 Implementar validación en `decrypt()` para verificar formato correcto de `ENC[...]`.
- [ ] 6.2 Capturar errores de authentication tag inválido (GCM) y lanzar error descriptivo.
- [ ] 6.3 Implementar mensaje de error cuando falta llave de desencriptación para un proyecto.
- [ ] 6.4 Agregar warning cuando se intenta marcar variable como `secret` en Globals (sugerir usar environment local).

## 7. Testing

- [ ] 7.1 Crear tests unitarios para `CryptoService.encrypt()` y `decrypt()` verificando round-trip.
- [ ] 7.2 Crear test para `isEncrypted()` con diferentes formatos de entrada.
- [ ] 7.3 Crear test para `generateProjectKey()` verificando determinismo (mismo path → misma llave).
- [ ] 7.4 Crear test para `obfuscateKey()` y `deobfuscateKey()` verificando reversibilidad.
- [ ] 7.5 Crear test de integración para `EnvironmentManager.saveEnvironment()` con variables `secret`.
- [ ] 7.6 Crear test de integración para `EnvironmentManager.loadEnvironment()` con valores encriptados.
- [ ] 7.7 Crear test verificando que variables `default` NO se encriptan.
- [ ] 7.8 Crear test verificando que desencriptar con llave incorrecta falla apropiadamente.
- [ ] 7.9 Crear test verificando backwards compatibility (archivos sin valores encriptados).

## 8. Documentación

- [ ] 8.1 Documentar el formato `ENC[...]` en comentarios del código.
- [ ] 8.2 Documentar en README o docs que mover el proyecto de ubicación invalidará llaves de encriptación.
- [ ] 8.3 Documentar qué hacer si se pierde `globals.json` (secrets irrecuperables, recrear desde fuentes).
- [ ] 8.4 Agregar comentarios en código explicando por qué NO se encriptan Globals.

## 9. UI/UX (Opcional para MVP)

- [ ] 9.1 Considerar agregar indicador visual en EnvironmentManagerModal cuando una variable está encriptada en disco.
- [ ] 9.2 Considerar agregar tooltip explicando que variables `secret` se encriptan automáticamente.

## 10. Validación Manual

- [ ] 10.1 Crear environment con variable `type: 'secret'`, guardar y verificar que el archivo JSON contiene `ENC[...]`.
- [ ] 10.2 Cerrar y reabrir el environment, verificar que el valor se desencripta correctamente.
- [ ] 10.3 Modificar manualmente el valor encriptado en el archivo y verificar que muestra error al cargar.
- [ ] 10.4 Borrar la llave del proyecto de `globals.json` y verificar que muestra error al intentar desencriptar.
- [ ] 10.5 Verificar que variables `default` permanecen en texto plano en el archivo.
- [ ] 10.6 Verificar que agregar variable `secret` a Globals NO la encripta (opcional: muestra warning).
