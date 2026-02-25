## Context

La aplicación actualmente almacena environments en archivos JSON planos. Existe el concepto de variables tipo `secret` que se muestran ofuscadas en la UI, pero no están protegidas en disco, perdiendo seguridad al compartirlas.

El flujo actual en la nube de este entorno necesita un soporte de equipo. Al utilizar criptografía asimétrica o master passwords estropeábamos el UX o matábamos la posibilidad de Git. Hemos derivado la Opción 2: **Archivo ignorado Local de Encriptación Simétrica (`environment.key`)**.

## Goals / Non-Goals

**Goals:**
- Encriptar automáticamente valores de `secret` en un ambiente local, basándose en la llave maestra del proyecto que vive en el entorno físico de trabajo.
- Mantener compatibilidad hacia atrás.
- Asegurar portabilidad del entorno para equipos, independientemente de la ruta física absoluta de la raíz (`path`).
- Simplificar que los equipos compartan entornos (comparten `environment.key` a través de un chat o lastpass) y ya los JSON en Git pueden publicarse.
- Módulo nativo Node.js Crypto (AES-256-GCM).

**Non-Goals:**
- Encriptar el JSON completo
- Implementar llaves maestras en `globals.json` o contraseñas dinámicas.

## Decisions

### 1. Algoritmo de Encriptación
- **Decisión**: AES-256-GCM
- **Razón**: `crypto` provee la autenticación necesaria con los salt integrados y autovalidación de Tags que previene la manipulación sin llave.

### 2. Formato de Valor Encriptado
- **Decisión**: `ENC[AES256_GCM:iv:<hex>:data:<hex>:tag:<hex>]`

### 3. Generación y Almacenamiento de Llave
- **Decisión**: Se genera de un buffer seguro de 32 bytes (256 bits) convertidos a Base64-String y se graba directamente en `<projectRoot>/environment.key` si no hay uno anterior al requerir cifrar.
- **Razón**: Desvincula el path del usuario (a diferencia de PBKDF2), hace instantáneo el transporte del token para otro miembro del equipo (simplemente pasándole el archivo textual), y se evita cualquier ofuscación ambigua a nivel global.

### 4. Flujo de Encriptación / Desencriptación
- **Decisión**: Transparente en `EnvironmentManager.saveEnvironment()` y `loadEnvironment()`.

### 5. Configurar o proponer `.gitignore`
- **Decisión**: Al generar `environment.key`, la idea es inyectarlo en `.gitignore` si este existe de forma automática. 
- **Razón**: Las malas prácticas pueden pasarle factura al proyecto.

## Risks / Trade-offs

- **Risk**: El archivo de llaves puede ser incluido accidentalmente en el repositorio.
  - **Mitigation**: Intentar colocarlo per se en el `.gitignore` existente.

- **Risk**: Compañeros intentan abrirlo y genera Error por carencia.
  - **Mitigation**: Detectar y reportar: "Falta environment.key que cifra este proyecto, debes colocar el acordado para leer este esquema".

## Migration Plan

1. Retirar antigua lógica de `globals.json / _encryptionKeys`.
2. Re-escribir generación estocástica de Cryptography.
3. Asegurar lectura física de `fs/promises` para la búsqueda de la llave.

## Open Questions

- ¿Tendremos luego una versión en Web o Sandbox sin acceso al sistema de archivos local?
  - **Trade-off:** La escritura se mantiene enfocada solo a la persistencia del Electron Runtime Actual.
