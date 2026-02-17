## Why

Actualmente, los environment files (`.j5env`) almacenan todas las variables en texto plano, incluyendo API keys, tokens, passwords y otros secrets. Esto representa un riesgo de seguridad significativo cuando:

- Los archivos de environment se versionen en Git junto con el proyecto.
- Los environments se comparten entre miembros del equipo a través de mensajería o email.
- Se hace backup de la carpeta del proyecto a servicios cloud.

Aunque la aplicación ya tiene el concepto de variables tipo `secret` (que se muestran como `****` en la UI), estos valores aún se almacenan sin protección en disco.

El usuario necesita poder compartir environments de forma segura, versionarlos en Git y trabajar colaborativamente sin exponer credentials sensibles. La encriptación automática de variables marcadas como `secret` resuelve este problema manteniendo la simplicidad y portabilidad del sistema actual.

## What Changes

Se implementará un sistema de encriptación inline para variables de tipo `secret` en environment files locales:

**Comportamiento automático:**
- Cuando una variable se marca como `type: 'secret'`, su valor se encripta automáticamente al guardar el archivo.
- El valor encriptado se almacena inline en el mismo archivo JSON usando una notación especial.
- Al cargar el environment, los valores encriptados se desencriptan transparentemente.

**Gestión de llaves:**
- Cada proyecto abierto tiene su propia llave de encriptación (llave por proyecto).
- La llave se almacena en `~/.j5request/globals.json` en formato ofuscado (no texto plano).
- Las llaves se generan automáticamente al encriptar la primera variable `secret` de un proyecto.

**Alcance:**
- Solo se encriptan environments **locales** del proyecto (archivos en `proyecto/.j5env/*.json`).
- **No se encriptan globals** (`~/.j5request/globals.json`) ya que están protegidos por permisos del SO.

**Formato de archivo:**
```json
{
  "id": "prod",
  "name": "Production",
  "variables": [
    {
      "key": "API_URL",
      "value": "https://api.prod.com",
      "type": "default",
      "enabled": true
    },
    {
      "key": "API_KEY",
      "value": "ENC[AES256_GCM:iv:abc123:data:xyz789:tag:def456]",
      "type": "secret",
      "enabled": true
    }
  ]
}
```

## Capabilities

### New Capabilities

- `secret-variable-encryption`: Capacidad de encriptar automáticamente el valor de variables marcadas como `type: 'secret'` usando encriptación AES-256-GCM, con gestión automática de llaves por proyecto almacenadas de forma ofuscada en la configuración global del usuario.

### Modified Capabilities

<!-- Sin modificaciones a capacidades existentes -->

## Impact

- **EnvironmentManager**: Modificación para encriptar/desencriptar valores de variables `secret` al guardar/cargar.
- **Crypto Module**: Nuevo módulo para encriptación AES-256-GCM con key derivation.
- **Globals Storage**: Extensión para almacenar llaves de encriptación por proyecto (ofuscadas).
- **Environment Store**: Lógica de desencriptación transparente al cargar environments.
- **Security**: Mejora significativa en la protección de secrets almacenados en disco.
- **User Experience**: Transparente, sin cambios en el flujo de trabajo del usuario (automático).
- **File Format**: Backwards compatible (variables sin marcar `secret` siguen en texto plano).
