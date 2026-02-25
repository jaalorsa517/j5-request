## Why

Actualmente, los environment files (`.j5env`) almacenan todas las variables en texto plano, incluyendo API keys, tokens, passwords y otros secrets. Esto representa un riesgo de seguridad significativo cuando:

- Los archivos de environment se versionen en Git junto con el proyecto.
- Los ambientes se exponen accidentalmente.

Aunque la aplicación ya tiene el concepto de variables tipo `secret` (que se muestran como `****` en la UI), estos valores aún se almacenan sin protección en disco.

En un entorno colaborativo, los desarrolladores necesitan compartir sus `environment.json` a través de Git y trabajar colaborativamente sin exponer credenciales sensibles. La solución óptima es encriptar los valores en disco, pero usando una llave que sea específica al proyecto, y que no se suba a Git (Ignorada). Esto delega la distribución segura de esta llave a los miembros del equipo.

## What Changes

Se implementará un sistema de encriptación inline para variables de tipo `secret` en environment files locales:

**Comportamiento automático:**
- Cuando una variable se marca como `type: 'secret'`, su valor se encripta automáticamente al guardar el archivo.
- El valor encriptado se almacena inline usando una notación especial `ENC[...]`.
- Al cargar el environment, los valores encriptados se desencriptan transparentemente si la llave del proyecto está presente.

**Gestión de llaves:**
- La llave de encriptación para el proyecto se generará de manera aleatoria segura (AES-256) la primera vez que se necesite guardar un secreto.
- Esta llave se guardará en un archivo llamado `environment.key` en la raíz del proyecto.
- La aplicación instruirá al usuario sobre la importancia de agregar `environment.key` a su `.gitignore`.
- Los miembros del equipo deberán compartir este archivo `environment.key` de forma segura (por ejemplo, a través de un gestor de contraseñas de equipo) para poder leer y escribir en los ambientes del proyecto compartido.

**Alcance:**
- Solo se encriptan environments **locales** del proyecto.
- **No se encriptan globals** ya que están protegidos por permisos del SO y no se comparten.

## Capabilities

### New Capabilities

- `secret-variable-encryption`: Capacidad de encriptar automáticamente el valor de variables marcadas como `type: 'secret'` usando encriptación AES-256-GCM, con una llave simétrica alojada en un archivo local `environment.key` a nivel de proyecto pensado para un flujo colaborativo (gitignore).

## Impact

- **EnvironmentManager**: Modificación para encriptar/desencriptar valores de variables `secret` usando la llave local `environment.key`.
- **Crypto Module**: Adaptación para cargar la llave desde el archivo del proyecto en vez del global.
- **Configuración de Proyecto**: Creación del archivo `environment.key` transparente pero físico.
- **User Experience**: Aviso/tutorial ligero sobre compartir la llave `environment.key` de forma segura con el equipo.
- **Team Workflow**: Permite versionar los settings de ambientes `.json` de forma segura.
