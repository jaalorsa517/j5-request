## Why

Actualmente, la aplicación solo puede realizar requests HTTPS a servidores con certificados SSL/TLS válidos emitidos por Certificate Authorities (CAs) públicas reconocidas. Esto presenta limitaciones críticas en varios escenarios reales de desarrollo y producción:

- **Entornos de desarrollo local**: Servidores con certificados auto-firmados no pueden ser consumidos sin modificar configuraciones del sistema operativo.
- **APIs corporativas**: Empresas con infraestructura interna que usa CAs privadas no pueden ser testeadas desde la aplicación.
- **Mutual TLS (mTLS)**: APIs que requieren autenticación de cliente mediante certificados no pueden ser accedidas.
- **Staging/Pre-producción**: Ambientes con certificados temporales o auto-firmados son inaccesibles.

Los desarrolladores actualmente deben:
1. Modificar la configuración del sistema operativo para confiar en certificados personalizados (no portátil, afecta otras apps).
2. Usar herramientas alternativas como `curl` con flags inseguros (`-k`, `--insecure`).
3. No poder testear APIs con mTLS desde la aplicación.

Esto rompe el flujo de trabajo "API-as-Code" que la aplicación busca ofrecer, obligando a los usuarios a recurrir a soluciones externas.

## What Changes

Se agregará soporte completo para configurar certificados SSL/TLS por request o por project, permitiendo:

**Capacidades principales:**
- Cargar certificados de CA personalizados (`.crt`, `.pem`) para confiar en servidores específicos.
- Configurar certificados de cliente y llaves privadas para Mutual TLS (mTLS).
- Opcionalmente deshabilitar verificación SSL (solo para desarrollo, con advertencia clara).

**Alcance de configuración:**
- **Nivel de Request**: Certificados específicos por request individual.
- **Nivel de Proyecto**: Certificados compartidos para todos los requests del proyecto.

**Ubicación de archivos:**
- Los certificados se almacenan en la carpeta del proyecto (ej. `proyecto/.j5certs/`).
- Las rutas se referencian relativamente en los archivos `.j5request`.

**Flujo de trabajo:**
1. Usuario selecciona archivos de certificado desde la UI (Request Panel o configuración de proyecto).
2. La aplicación copia/referencia los certificados.
3. Al ejecutar el request, Node.js `https` module usa los certificados configurados.

## Capabilities

### New Capabilities

- `ssl-certificate-configuration`: Capacidad para configurar certificados SSL/TLS personalizados (CA certificates, client certificates para mTLS, llaves privadas) a nivel de request individual o proyecto completo, permitiendo consumir APIs con certificados auto-firmados, CAs privadas o que requieran autenticación mutua TLS.

### Modified Capabilities

<!-- Sin modificaciones a capacidades existentes -->

## Impact

- **Request Model**: Extensión del tipo `J5Request` para incluir campos de configuración SSL (`sslConfig`).
- **RequestExecutor**: Modificación para pasar opciones SSL al módulo `https` de Node.js.
- **UI Components**: Nuevo panel/sección en RequestEditor para configurar certificados.
- **File System**: Gestión de archivos de certificados (lectura, validación).
- **Project Configuration**: Posible nuevo archivo `.j5project.json` para configuración a nivel de proyecto.
- **Security**: Advertencias claras cuando se deshabilita verificación SSL.
- **User Experience**: File pickers para seleccionar certificados, validación de formato PEM.
