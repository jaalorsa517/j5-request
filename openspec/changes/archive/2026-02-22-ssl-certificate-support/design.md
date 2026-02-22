## Context

Node.js `https` module acepta opciones para configurar certificados SSL/TLS cuando se crea un request. Las opciones relevantes son:
- `ca`: Array de certificados CA en formato string (PEM)
- `cert`: Certificado de cliente para mTLS
- `key`: Llave privada del certificado de cliente
- `rejectUnauthorized`: Boolean para deshabilitar verificación (inseguro)

Actualmente, `RequestExecutor` usa `axios` con configuración por defecto que solo confia en CAs públicas del sistema.

La aplicación ya tiene:
- `FileSystemService` para operaciones de archivos
- `J5Request` type con campos para URL, method, headers, body
- Request execution flow: UI → Store → IPC → RequestExecutor → axios

## Goals / Non-Goals

**Goals:**
- Soportar CAs personalizadas (certificados `.crt`, `.pem`).
- Soportar Mutual TLS (client cert + private key).
- Permitir deshabilitar verificación SSL (con advertencia clara).
- Configuración a nivel de request individual.
- Configuración a nivel de proyecto (compartida por todos los requests).
- Almacenar rutas a certificados (no el contenido) en `.j5request` files.

**Non-Goals:**
- Gestión de certificados integrada (generación, renovación, revocación).
- Soporte para formatos no-PEM (ej. `.p12`, `.pfx`) en v1.
- Validación de expiración de certificados (Node.js lo maneja).
- Re-trust de CAs del sistema (solo agregar, no reemplazar).

## Decisions

### 1. Modelo de Datos para SSL Config
- **Decisión**: Agregar campo opcional `sslConfig` al tipo `J5Request`:
  ```typescript
  type SSLConfig = {
    ca?: string[];           // Rutas a archivos CA
    clientCert?: string;     // Ruta a certificado de cliente
    clientKey?: string;      // Ruta a llave privada
    rejectUnauthorized?: boolean;  // Default: true
  };
  ```
- **Razón**: Separar configuración SSL del resto del request para claridad y reutilización potencial.

### 2. Almacenamiento de Certificados
- **Decisión**: Almacenar certificados en carpeta del proyecto `.j5certs/`, referenciar por ruta relativa.
- **Alternativa considerada**: Almacenar contenido embedded en `.j5request`. Rechazada porque genera archivos enormes y difíciles de versionar.
- **Razón**: 
  - Portabilidad: Al clonar repo, los certificados vienen incluidos.
  - Legibilidad: `.j5request` files permanecen ligeros.
  - Versionado: Git puede trackear cambios en certificados separadamente.

### 3. Configuración a Nivel de Proyecto
- **Decisión**: Crear archivo opcional `.j5project.json` en la raíz del proyecto:
  ```json
  {
    "ssl": {
      "ca": [".j5certs/custom-ca.pem"],
      "rejectUnauthorized": true
    }
  }
  ```
- **Razón**: Permite configuración compartida sin duplicar en cada request.
- **Precedencia**: Request-level override project-level.

### 4. Lectura de Certificados
- **Decisión**: Leer archivos de certificados en el proceso main (Node.js) justo antes de ejecutar el request.
- **Razón**: 
  - Seguridad: No pasar contenidos de certificados por IPC innecesariamente.
  - Performance: Leer solo cuando se necesita.
  - Simplicidad: No cache de certificados en memoria.

### 5. UI para Configuración
- **Decisión**: Agregar nueva sección "SSL/TLS" en RequestPanel (similar a Headers/Body) con:
  - File picker para seleccionar CA certificates (multi-select).
  - File picker para client certificate + key.
  - Toggle para "Disable SSL Verification" con advertencia.
- **Razón**: Consistente con el diseño actual de la aplicación.

### 6. Validación de Certificados
- **Decisión**: Validación básica (verificar que archivos existen y son PEM válidos) antes de ejecutar request.
- **Razón**: Feedback inmediato al usuario vs. error críptico de Node.js.

### 7. Advertencia de Seguridad
- **Decisión**: Si `rejectUnauthorized: false`, mostrar banner rojo en RequestPanel: "⚠️ SSL Verification Disabled - Insecure!".
- **Razón**: Prevenir uso accidental en producción.

## Risks / Trade-offs

- **Risk**: Usuario comete certificados privados sensibles a Git.
  - **Mitigation**: Documentar best practice de usar `.gitignore` para `.j5certs/` si contienen secrets. Considerar advertencia en UI.

- **Risk**: Rutas a certificados se rompen si el proyecto se mueve o se clona en otra máquina con estructura diferente.
  - **Mitigation**: Usar siempre rutas relativas al proyecto. Documentar claramente.

- **Risk**: `rejectUnauthorized: false` es extremadamente inseguro y podría usarse inadvertidamente en producción.
  - **Mitigation**: 
    - Banner rojo permanente en UI cuando está activo.
    - No permitir guardarlo en configuración de proyecto global (solo request individual).
    - Agregar en exportación a cURL/otros formatos un comentario WARNING.

- **Risk**: Formato PEM es el único soportado inicialmente, pero algunos users pueden tener `.p12`/`.pfx`.
  - **Mitigation**: Documentar conversión con OpenSSL. Considerar soporte nativo en v2.

- **Trade-off**: Configuración a nivel de proyecto añade complejidad (nuevo archivo `.j5project.json`).
  - **Aceptable**: Es opt-in. Solo se crea si el usuario configura SSL globalmente.

## Open Questions

- ¿Deberíamos proveer helpers para generar certificados auto-firmados desde la UI?
  - **Decisión pendiente**: No para MVP. Users pueden usar OpenSSL. Considerar para futuro.

- ¿Deberíamos soportar auto-load de certificados desde variables de environment (ej. `{{CERT_PATH}}`)?
  - **Decisión pendiente**: Sí, sería útil. Implementar como mejora si users lo piden.
