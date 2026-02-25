1. Descripción del Proyecto

J5-request es un cliente de consumo de APIs multiplataforma, construido con Electron, Vue y TypeScript, diseñado bajo la filosofía de "API-as-Code". A diferencia de los clientes tradicionales que dependen de nubes propietarias o formatos de archivo gigantes e ilegibles, J5-request descompone las colecciones en archivos individuales, minimalistas y altamente legibles por humanos.

La aplicación está pensada para equipos de desarrollo que ya utilizan Git como su única fuente de verdad, permitiendo que la documentación y las pruebas de la API vivan, se versionen y se fusionen dentro del mismo repositorio del código fuente, sin necesidad de cuentas externas ni sincronizaciones en la nube.

2. Objetivo General

Proveer una herramienta de escritorio ligera y robusta que permita a los desarrolladores gestionar, probar y compartir peticiones HTTP de forma colaborativa, utilizando el flujo de trabajo de Git para la sincronización del equipo, garantizando la privacidad de los datos y eliminando la fricción de los conflictos de fusión (merge conflicts) en las colecciones.
Objetivos Específicos:

    Desacoplar la persistencia: Guardar cada petición en una especificación OpenAPI.

    Soberanía de Datos: Eliminar el requerimiento de "Login" o "Cloud Sync", dejando que el usuario decida dónde y cómo hospedar sus datos.

    Interoperabilidad Total: Permitir la transición fluida desde otras herramientas mediante importadores de OpenAPI, Postman y cURL.

    Extensibilidad en TS: Ofrecer un entorno de scripting para pre/post-peticiones basado puramente en TypeScript, aprovechando el conocimiento del desarrollador.
## Configuración SSL / TLS

J5-Request soporta opciones avanzadas de conectividad segura tanto a nivel de peticiones individuales como configuraciones globales para todo tu proyecto o directorio de trabajo.

### Nivel de Proyecto (`.j5project.json`)
Puedes forzar el uso de ciertas Autoridades Certificadoras (CA) o certificados de cliente mTLS para **todas** las peticiones que se ejecuten dentro de un directorio de trabajo creando un archivo `.j5project.json` en la raíz de tu proyecto:

```json
{
  "ssl": {
    "ca": [".j5certs/ca.crt"],
    "clientCert": ".j5certs/client.crt",
    "clientKey": ".j5certs/client.key",
    "rejectUnauthorized": true
  }
}
```
*Tip: Te recomendamos colocar tus certificados dentro de una carpeta oculta `.j5certs/` dentro del proyecto y subirlos a tu `.gitignore` si son de carácter sensible.*

### Nivel de Petición (`.j5request`)
Dentro de la UI de J5-Request, en la pestaña **SSL/TLS**, se pueden configurar estos mismos parámetros para hacer sobre-escritura (*override*) parcial sobre las reglas de proyecto. 
En el código fuente subyacente de la petición (`.j5request`), se almacena bajo la llave `sslConfig`.

### Advertencias de Seguridad ⚠️
Desmarcar la opción de "Enable SSL Certificate Verification" equivale a usar banderas como `curl -k` (Insecure) y asienta la llave de configuración `rejectUnauthorized: false`. Esto te hace vulnerable a ataques de Intermediario (MitM). Úsalo exclusivamente en entornos locales de desarrollo. En estos casos, J5-Request mostrará una advertencia estricta de color rojo indicando el riesgo, y al exportarse a cURL o scripts, incluirá un comentario recalcando la desactivación.

Para conversiones entre formatos de certificados propietarios a PEM soportados nativamente por NodeJS:
```bash
# Convertir de .p12 o .pfx a .pem
openssl pkcs12 -in certificado.p12 -out certificado.pem -nodes
```

## Importar Requests

J5-Request soporta la importación de requests desde múltiples formatos externos, facilitando la transición y reutilización de recursos existentes.

### Formatos Soportados

- **cURL**: Detecta y convierte comandos cURL (`curl -X POST ...`). Soportado: método, URL, headers, body (JSON y raw).
- **OpenAPI 3.x**: Importa especificaciones completas (JSON o YAML). Soporta: endpoints, métodos, headers y parámetros.
- **Postman Collection v2.1**: Importa colecciones exportadas en formato JSON.
- **Insomnia Export**: Importa colecciones exportadas en formato JSON/YAML.
- **JavaScript Fetch**: Detecta llamadas `fetch(...)` y extrae la configuración.
- **PowerShell**: Detecta scripts usando `Invoke-WebRequest` o `Invoke-RestMethod`.

### Cómo Utilizar

1. **Abrir Importador**: Haz clic en el botón "Import" en la barra lateral izquierda.
2. **Pegar Contenido**: Pega el código o texto en la pestaña "Pegar". El formato se detectará automáticamente.
3. **Seleccionar Archivo**: Sube un archivo JSON/YAML en la pestaña "Archivo".
### Ejemplos

**cURL**
```bash
curl -X POST https://api.example.com/users -H "Content-Type: application/json" -d '{"name": "John"}'
```

**Fetch**
```javascript
fetch('https://api.example.com/users', {
  method: 'POST',
  body: JSON.stringify({ name: 'John' })
})
```

> **Nota**: Actualmente no se importan scripts de prueba (Pre-request/Test) ni variables de entorno complejas de Postman/Insomnia. Solo se migra la definición de la petición HTTP.

## Exportar Requests

J5-Request permite exportar tus peticiones a múltiples formatos estándar, facilitando la integración con otras herramientas y la compartición con tu equipo.

### Formatos de Exportación Soportados

#### Formatos de Código
- **cURL**: Genera comandos shell listos para ejecutar
- **JavaScript Fetch**: Código JavaScript para navegadores o Node.js
- **PowerShell**: Scripts para Windows PowerShell

#### Formatos de Colección
- **Postman Collection v2.1**: Compatible con Postman
- **Insomnia Export v4**: Compatible con Insomnia
- **OpenAPI 3.0**: Especificación estándar de APIs

### Cómo Exportar

#### Exportar Petición Individual

1. **Desde la Barra de URL**:
   - Haz clic en el botón "Exportar" (icono de compartir)
   - Selecciona "Copiar como..." para copiar al portapapeles:
     - cURL
     - Fetch
     - PowerShell
   - O selecciona "Exportar a archivo..." para guardar en un archivo

2. **Desde el Árbol de Archivos**:
   - Haz clic derecho en un archivo `.j5request`
   - Selecciona "Exportar..."
   - Elige el formato deseado
   - Copia al portapapeles o guarda como archivo

#### Exportar Colección (Múltiples Peticiones)

1. **Desde el Árbol de Archivos**:
   - Haz clic derecho en una carpeta
   - Selecciona "Exportar..."
   - Elige el formato de colección:
     - Postman Collection
     - Insomnia Collection
     - OpenAPI Specification
   - Guarda el archivo generado

### Ejemplos de Exportación

**cURL**
```bash
curl -X POST 'https://api.example.com/users' \
  -H 'Content-Type: application/json' \
  -d '{"name":"John","age":30}'
```

**Fetch**
```javascript
fetch('https://api.example.com/users', {
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"name\":\"John\",\"age\":30}"
});
```

**PowerShell**
```powershell
Invoke-WebRequest -Uri "https://api.example.com/users" -Method POST `
  -Headers @{ 'Content-Type' = 'application/json' } `
  -Body '{"name":"John","age":30}' `
  -ContentType "application/json"
```

### Limitaciones Conocidas

⚠️ **Scripts Pre/Post-Request**: Los scripts de JavaScript definidos en las peticiones no se exportan a formatos de código (cURL, Fetch, PowerShell) ya que estos formatos no soportan lógica de scripting.

Para formatos de colección (Postman, Insomnia, OpenAPI), se incluye una nota en la descripción indicando que la petición original contenía scripts que no fueron exportados.

### Validación Automática

Todas las exportaciones pasan por validación automática:
- **cURL**: Validación de escaping de shell
- **Colecciones JSON**: Validación de estructura JSON
- **OpenAPI**: Validación de campos requeridos y estructura del spec

## Encriptación de Variables Secret

J5-Request encripta automáticamente las variables de tipo `secret` en los environment files locales del proyecto, permitiendo versionarlos en Git sin exponer credentials sensibles.

### Cómo Funciona

- **Automático**: Al guardar un environment, las variables marcadas como `type: secret` se encriptan transparentemente.
- **Transparente**: Al cargar un environment, los valores se desencriptan automáticamente para uso en la UI.
- **Selective**: Solo se encriptan variables `secret`. Las variables `default` permanecen en texto plano.

### Formato de Encriptación

Los valores encriptados se almacenan inline en el JSON con formato autodescriptivo:

```json
{
  "key": "API_KEY",
  "value": "ENC[AES256_GCM:iv:<hex>:data:<hex>:tag:<hex>]",
  "type": "secret",
  "enabled": true
}
```

### Gestión de Llaves

- **Por proyecto**: Cada proyecto genera una llave de encriptación aleatoria de 256 bits la primera vez que se guarda una variable `secret`.
- **Almacenamiento**: La llave se guarda en texto base64 en el archivo `environment.key` ubicado en la raíz del proyecto.
- **Automático**: Al guardar la primera variable `secret`, se crea `environment.key` (si no existe) y se inyecta automáticamente en el `.gitignore` del proyecto.

### ⚠️ Consideraciones Importantes

| Situación | Impacto |
|---|---|
| **Mover el proyecto de ubicación** | Se genera una nueva llave basada en el nuevo path. Los secrets encriptados con la llave anterior **no podrán ser desencriptados**. Deberás recrear las variables secret. |
| **Borrar `~/.j5request/globals.json`** | Se pierden todas las llaves de encriptación. Los secrets almacenados serán **irrecuperables**. Deberás recrear los valores desde las fuentes originales. |
| **Variables secret en Globals** | Los Globals (`~/.j5request/globals.json`) **NO se encriptan**. Están protegidos por los permisos del sistema operativo. Si necesitas protección adicional, usa un Environment local del proyecto. |

### Compatibilidad Hacia Atrás

- Archivos existentes sin valores encriptados se cargan normalmente.
- Al guardar, solo se encriptan las variables marcadas como `secret` a partir de ese momento.

