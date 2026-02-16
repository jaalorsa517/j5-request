## Context

La aplicación actualmente almacena environments en archivos JSON planos. Ya existe el concepto de variables tipo `secret` que se muestran ofuscadas en la UI, pero no están protegidas en disco.

Node.js tiene el módulo `crypto` nativo que soporta AES-256-GCM, que es adecuado para este caso de uso. No requiere dependencias externas.

El sistema actual tiene:
- `EnvironmentManager` que maneja carga/guardado de environments
- `globals.json` en `~/.j5request/` para configuración global del usuario
- Environment files locales en carpetas de proyecto

El flujo actual es: UI → Store → IPC → EnvironmentManager → FileSystem

## Goals / Non-Goals

**Goals:**
- Encriptar automáticamente el valor de variables marcadas como `type: 'secret'`.
- Desencriptar transparentemente al cargar el environment.
- Generar y almacenar llaves de encriptación por proyecto.
- Ofuscar las llaves en `globals.json` (no almacenar en texto plano).
- Mantener compatibilidad hacia atrás (archivos sin secrets encriptados siguen funcionando).
- Implementación usando Node.js `crypto` nativo (sin dependencias externas).

**Non-Goals:**
- Encriptar el archivo completo (solo valores de variables `secret`).
- Encriptar globals (ya protegidos por permisos del SO).
- Solicitar password al usuario (llave automática por proyecto).
- Rotación de llaves (fuera de scope del MVP).
- Compartir llaves entre máquinas (cada máquina genera su propia llave).

## Decisions

### 1. Algoritmo de Encriptación
- **Decisión**: AES-256-GCM
- **Alternativa considerada**: AES-256-CBC. Rechazada porque GCM provee autenticación integrada.
- **Razón**: GCM es authenticated encryption, previene tampering. Estándar de industria, soportado nativamente por Node.js.

### 2. Formato de Valor Encriptado
- **Decisión**: `ENC[AES256_GCM:iv:<hex>:data:<hex>:tag:<hex>]`
- **Razón**: 
  - Autodescriptivo (fácil detectar valores encriptados).
  - Contiene toda la información necesaria para desencriptar (IV, data, auth tag).
  - Human-readable en el archivo JSON (para debug).

### 3. Generación de Llave por Proyecto
- **Decisión**: Llave derivada del path absoluto del proyecto usando PBKDF2.
- **Alternativa considerada**: Llave aleatoria pura. Rechazada porque requeriría storage más complejo.
- **Razón**:
  - Determinística: mismo proyecto = misma llave.
  - Portabilidad: si el usuario mueve el proyecto y vuelve a abrirlo, regenera la misma llave.
  - PBKDF2 agrega key stretching para seguridad adicional.

### 4. Almacenamiento de Llave en Globals
- **Decisión**: Almacenar en `globals.json` bajo clave `_encryptionKeys: { [projectPath]: obfuscatedKey }`
- **Ofuscación**: Base64(projectPath XOR key) - no es criptografía fuerte, pero previene lectura casual.
- **Razón**: 
  - Centralizadoen un lugar que ya existe.
  - Ofuscación suficiente para prevenir exposición accidental.
  - La seguridad real viene de los permisos del filesystem del SO (globals solo legible por el usuario).

### 5. Flujo de Encriptación/Desencriptación
- **Decisión**: Transparente en `EnvironmentManager.saveEnvironment()` y `loadEnvironment()`.
- **Razón**: Encapsulación. El resto de la app no sabe que hay encriptación, trabaja con valores planos.

### 6. Cuando NO Encriptar
- **Decisión**: Variables con `type: 'default'` nunca se encriptan, solo `type: 'secret'`.
- **Razón**: Balance entre seguridad y legibilidad. URLs, nombres de usuario, etc. no necesitan encriptación y es útil verlos en texto plano para debugging.

## Risks / Trade-offs

- **Risk**: Si el usuario borra `globals.json`, pierde las llaves y no puede desencriptar secrets.
  - **Mitigation**: Documentar esto claramente. Considerar agregar export/import de llaves en futuro. Para MVP, aceptable.

- **Risk**: El formato `ENC[...]` es detectable, alguien podría intentar fuerza bruta.
  - **Mitigation**: PBKDF2 con alto iteration count hace fuerza bruta prohibitivamente costosa. 

- **Risk**: Ofuscación en globals no es encriptación real.
  - **Mitigation**: La seguridad real viene de permisos del filesystem. Ofuscación es solo para prevenir leaks accidentales (logs, screenshots).

- **Risk**: Si alguien tiene acceso al filesystem del usuario, puede leer globals y desencriptar.
  - **Mitigation**: Aceptable. Si un atacante tiene acceso al filesystem del usuario, ya tiene acceso a todo. El objetivo es proteger secrets en Git/compartidos, no en la máquina local comprometida.

- **Trade-off**: Git diff no muestra qué cambió en un valor encriptado.
  - **Aceptable**: Es el precio de la seguridad. El usuario puede ver cambios en la UI.

## Migration Plan

1. **Despliegue**: La funcionalidad es opt-in por diseño (solo encripta si `type: 'secret'`).
2. **Backwards Compatibility**: Archivos existentes siguen funcionando. Al guardar un environment con variables `secret`, se encriptan en ese momento.
3. **Rollback**: Si hay un problema, el usuario puede:
   - Cambiar `type: 'secret'` a `type: 'default'` para forzar guardado en texto plano.
   - Editar manualmente el JSON y reemplazar `ENC[...]` con el valor plano.

## Open Questions

- ¿Debería haber una UI para ver/regenerar llaves de encriptación?
  - **Decisión pendiente**: No para MVP. Considerar en futuro si users lo piden.

- ¿Deberíamos loggear warnings cuando se detecta un valor encriptado pero falta la llave?
  - **Decisión pendiente**: Sí, mostrar error claro explicando que falta la llave de desencriptación.
