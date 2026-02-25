## 1. Módulo de Criptografía (Reajuste)

- [x] 1.1 Modificar `src/main/services/CryptoService.ts` quitando la lógica de PBKDF2 dependiente del path.
- [x] 1.2 Implementar método estocástico `generateRandomKey(): Buffer` que retorne 32 bytes en lugar del antiguo por Path.
- [x] 1.3 Eliminar lógica de `obfuscateKey` y `deobfuscateKey` y Base64Mask (Innecesario ya que la cadena existirá en texto dentro del environment.key).

## 2. Gestión de Llaves Local (En Raíz de Proyecto)

- [x] 2.1 En `EnvironmentManager.ts` eliminar métodos asociados con `globals.json` `_encryptionKeys` o simplificarlos si servían por diseño a otras clases.
- [x] 2.2 Re-implementar método `getOrCreateProjectKey(projectPath: string): Promise<Buffer>` para buscar el archivo `environment.key` en dicho directorio o crearlo invocando `CryptoService.generateRandomKey()`.
- [x] 2.3 Implementar lectura de `environment.key` en forma Base64-String a `Buffer` o `Hex` (Preferible Base64).
- [x] 2.4 Agregar lógica auxiliar en `writeProjectKey` para inyectar automáticamente `environment.key` al archivo `.gitignore` si existiese.

## 3. Integración con Operaciones FileSystem

- [x] 3.1 Ajustar lógica `loadEnvironment` para fallar explícitamente y mostrar el error `MISSING_ENVIRONMENT_KEY` o advertencia en caso de que un ambiente intente abrir archivos cifrados con `ENC[...]` y que el archivo `environment.key` no esté en la carpeta.
- [x] 3.2 Corroborar que variables de Globals se mantengan ajenas al formato en `saveEnvironment`.

## 4. UI/UX

- [x] 4.1 Mostrar Modal o Notificación IPC al Usuario la primera vez que se configure un SECRETO para notificar sobre "Compartir Archivo environment.key" y que no lo suba.
- [x] 4.2 Si intenta abrir un JSON local cifrado sin el `.key`, lanzar Error Modal y denegar acción hasta que pegue el string / key del equipo.

## 5. Testing

- [x] 5.1 Adaptar test cases existentes en `EnvironmentManager.test.ts` asumiendo la inyección a archivo físico de llaves.
- [x] 5.2 Testear de manera virtual simulando que existe `.gitignore` y que éste absorbe el anexo de seguridad.
- [x] 5.3 Testear fracaso transparente si el Key físico cambió o se perdió.

## 6. Validación Manual Pospuesta

- [x] 6.1 Crear entorno con secret, guardarlo, revisar creación de `environment.key` e intrusión a `.gitignore`.
- [x] 6.2 Borrar `environment.key`, recargar la aplicación y abrir el proyecto. Comprobar que tira error de llave perdida y bloquea acceso.
- [x] 6.3 Restablecer/Pegar antigua key y cargar correctamente.
