# Spec: Secret Variable Encryption

## Purpose

Proteger valores sensibles (API keys, tokens, passwords) almacenados en environment files locales mediante encriptación automática usando una llave alojada físicamente en el proyecto (`environment.key`). Esta estrategia permite compartir o versionar los repositorios en Git sin riesgo de filtración, a condición de que el equipo intercambie la llave `environment.key` de manera segura fuera del control de versiones (out-of-band).

## Requirements

### Requirement: Encriptación Automática de Variables Secret
El sistema debe encriptar automáticamente el valor de variables marcadas como `type: 'secret'` al guardar el environment usando AES-256-GCM y la llave de `environment.key`.

#### Scenario: Guardar Variable Secret
- **WHEN** El usuario guarda un environment que contiene una variable con `type: 'secret'`.
- **THEN** El sistema encripta el valor de esa variable usando AES-256-GCM.
- **AND** El valor encriptado se almacena en formato `ENC[AES256_GCM:iv:<hex>:data:<hex>:tag:<hex>]`.
- **AND** Variables con `type: 'default'` se almacenan en texto plano sin cambios.

### Requirement: Desencriptación Transparente
El sistema debe desencriptar automáticamente valores encriptados al cargar el environment si la llave está presente.

#### Scenario: Cargar Environment con Secrets
- **WHEN** El usuario abre un environment que contiene valores en formato `ENC[...]`.
- **THEN** El sistema carga `environment.key` y desencripta cada valor.
- **AND** Presenta los valores desencriptados a la UI (transparente para el usuario).

#### Scenario: Llave de Desencriptación No Disponible (Colaborador sin llave)
- **WHEN** El sistema intenta desencriptar un valor pero el archivo `environment.key` NO EXISTE.
- **THEN** Muestra un error claro indicando que falta el archivo `environment.key` (esencial para desencriptar).
- **AND** El environment no se carga para evitar escrituras destructivas o corrupción de la UI.

### Requirement: Gestión de Llaves por Proyecto (Aleatorias en Disco Local)
El sistema debe generar, la primera vez, el archivo `environment.key` en el fólder del proyecto.

#### Scenario: Primera Encriptación en un Proyecto
- **WHEN** El usuario guarda por primera vez una variable `secret` en un proyecto donde NO existe `environment.key`.
- **THEN** El sistema genera una secuencia de 256 bits criptográficamente fuerte.
- **AND** Almacena esta llave en plano/hex en la raíz de proyecto (o donde residan los local envs) bajo el nombre `environment.key`.
- **AND** Usa esa llave para encriptar el valor.
- **AND** (Opcional) Si detecta un `.gitignore` y puede usarlo, intenta alertar o inyectar `environment.key` en él.

#### Scenario: Encriptaciones Subsecuentes / Llave Creada previemente
- **WHEN** El usuario guarda un secreto pero ya existe la llave (`environment.key`).
- **THEN** El sistema reutiliza la llave existente para encriptar nuevos secretos y no la sobreescribe.
- **AND** Un equipo diferente puede proporcionar su propio archivo `environment.key` por AirDrop, LastPass, etc., y el sistema lo utilizará automáticamente.

### Requirement: Formato de Archivo Compatible (Mixed)
El formato de archivo mixto (plain text + encriptado) se sostiene.

#### Scenario: Environment Mixto
- **WHEN** Un environment local tiene variables `secret` y `default`.
- **THEN** Solo las variables `secret` tienen valores en formato `ENC[...]`.
- **AND** Las variables `default` permanecen en texto plano sin afectar.

### Requirement: No modificar o encriptar el Scope "Globals"
El scope del usuario Global nunca encripta, asumiendo su inherente privacidad de usuario al SO.

#### Scenario: Guardar Secret Info en Globals
- **WHEN** El usuario guarda en Globals algo como "secret".
- **THEN** El sistema solo guarda pero omite su encriptación y desencriptación para no amarrarse a keys.
