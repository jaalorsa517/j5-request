# Spec: SSL Certificate Configuration

## Purpose

Permitir a los usuarios configurar certificados SSL/TLS personalizados para consumir APIs con certificados auto-firmados, CAs privadas, o que requieran Mutual TLS (mTLS), eliminando limitaciones actuales para entornos de desarrollo, staging y corporativos.

## Requirements

### Requirement: Configuración de CA Certificates
El sistema debe permitir cargar certificados de Certificate Authority (CA) personalizados.

#### Scenario: Agregar CA Personalizada
- **WHEN** El usuario agrega un certificado CA (`.crt` o `.pem`) en la sección SSL/TLS de un request.
- **THEN** El sistema guarda la ruta al certificado en el archivo `.j5request`.
- **AND** Al ejecutar el request, Node.js confía en ese CA además de los CAs del sistema.

#### Scenario: Múltiples CAs
- **WHEN** El usuario agrega múltiples certificados CA.
- **THEN** El sistema usa todos los CAs configurados (el request es válido si alguno de los CAs firma el certificado del servidor).

#### Scenario: CA No Encontrada
- **WHEN** El request referencia un archivo CA que no existe en el filesystem.
- **THEN** El sistema muestra error claro indicando que falta el archivo y su ruta esperada.
- **AND** El request no se ejecuta.

### Requirement: Mutual TLS (mTLS) Configuration
El sistema debe soportar autenticación de cliente mediante certificados.

#### Scenario: Configurar Client Certificate
- **WHEN** El usuario selecciona un certificado de cliente y su llave privada en la sección SSL/TLS.
- **THEN** El sistema guarda ambas rutas en el archivo `.j5request`.
- **AND** Al ejecutar el request, presenta el certificado de cliente al servidor durante el handshake TLS.

#### Scenario: Client Cert Sin Key
- **WHEN** El usuario selecciona un certificado de cliente pero no proporciona la llave privada.
- **THEN** El sistema muestra advertencia indicando que se requiere la llave privada para mTLS.
- **AND** No permite ejecutar el request hasta que se configure la llave.

#### Scenario: Key Sin Client Cert
- **WHEN** El usuario selecciona una llave privada pero no un certificado de cliente.
- **THEN** El sistema muestra advertencia similar (ambos son necesarios).

### Requirement: Deshabilitar Verificación SSL
El sistema debe permitir deshabilitar la verificación SSL para desarrollo local.

#### Scenario: Deshabilitar Verificación
- **WHEN** El usuario activa la opción "Disable SSL Verification" en un request.
- **THEN** El sistema guarda `rejectUnauthorized: false` en el archivo `.j5request`.
- **AND** Muestra un banner rojo de advertencia "⚠️ SSL Verification Disabled - Insecure!".
- **AND** Al ejecutar el request, acepta cualquier certificado (incluso inválido o auto-firmado).

#### Scenario: Advertencia de Seguridad
- **WHEN** Un request tiene `rejectUnauthorized: false`.
- **THEN** La UI muestra advertencia permanente en el RequestPanel.
- **AND** Si se exporta a cURL/otro formato, incluye comentario de advertencia.

### Requirement: Configuración a Nivel de Proyecto
El sistema debe soportar configuración SSL compartida para todos los requests de un proyecto.

#### Scenario: Configurar SSL Global del Proyecto
- **WHEN** El usuario configura CAs o settings SSL en la configuración del proyecto.
- **THEN** El sistema crea/actualiza `.j5project.json` con la configuración SSL.
- **AND** Todos los requests del proyecto heredan esa configuración por defecto.

#### Scenario: Override en Request Individual
- **WHEN** Un request tiene su propia configuración SSL y el proyecto también tiene configuración global.
- **THEN** La configuración del request individual tiene precedencia (override).
- **AND** Solo los valores especificados en el request se sobrescriben (merge parcial).

### Requirement: Validación de Certificados
El sistema debe validar que los archivos de certificados son válidos antes de ejecutar el request.

#### Scenario: Formato PEM Válido
- **WHEN** El usuario selecciona un archivo de certificado.
- **THEN** El sistema verifica que el archivo existe.
- **AND** Valida que el contenido está en formato PEM (contiene `-----BEGIN CERTIFICATE-----`).
- **AND** Si es válido, permite usar el certificado.

#### Scenario: Formato Inválido
- **WHEN** El usuario selecciona un archivo que no es un certificado PEM válido.
- **THEN** El sistema muestra error indicando que el formato no es soportado.
- **AND** Sugiere convertir usando OpenSSL si es necesario.

### Requirement: Rutas Relativas
Las rutas a certificados deben ser relativas al proyecto para portabilidad.

#### Scenario: Guardar Ruta Relativa
- **WHEN** El usuario selecciona un certificado desde el file picker.
- **THEN** El sistema convierte la ruta absoluta a relativa (relativa al proyecto root).
- **AND** Guarda la ruta relativa en `.j5request` (ej. `.j5certs/ca.pem`).

#### Scenario: Certificado Fuera del Proyecto
- **WHEN** El usuario selecciona un certificado fuera de la carpeta del proyecto.
- **THEN** El sistema muestra advertencia sugiriendo copiar el archivo al proyecto para portabilidad.
- **AND** Opcionalmente ofrece copiarlo automáticamente a `.j5certs/`.

### Requirement: UI para Configuración SSL
La UI debe proveer controles claros para configurar certificados.

#### Scenario: Sección SSL en RequestPanel
- **WHEN** El usuario navega al RequestPanel.
- **THEN** Existe una sección/tab "SSL/TLS" junto a Headers, Body, etc.
- **AND** La sección contiene:
  - Campo multi-select para CA certificates.
  - Campos para Client Certificate y Client Key (mTLS).
  - Toggle para "Disable SSL Verification" con advertencia.

#### Scenario: File Picker para Certificados
- **WHEN** El usuario hace clic en "Add CA Certificate".
- **THEN** Se abre un file picker nativo para seleccionar archivos `.crt`, `.pem`, `.cer`.
- **AND** Permite selección múltiple.

#### Scenario: Remover Certificado
- **WHEN** El usuario hace clic en icono de eliminar junto a un certificado configurado.
- **THEN** El certificado se remueve de la configuración.
- **AND** Se actualiza el archivo `.j5request`.
