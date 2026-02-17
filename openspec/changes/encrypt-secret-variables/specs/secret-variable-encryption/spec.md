# Spec: Secret Variable Encryption

## Purpose

Proteger valores sensibles (API keys, tokens, passwords) almacenados en environment files locales mediante encriptación automática, permitiendo versionarlos en Git y compartirlos de forma segura sin exponer credentials en texto plano.

## Requirements

### Requirement: Encriptación Automática de Variables Secret
El sistema debe encriptar automáticamente el valor de variables marcadas como `type: 'secret'` al guardar el environment.

#### Scenario: Guardar Variable Secret
- **WHEN** El usuario guarda un environment que contiene una variable con `type: 'secret'`.
- **THEN** El sistema encripta el valor de esa variable usando AES-256-GCM.
- **AND** El valor encriptado se almacena en formato `ENC[AES256_GCM:iv:<hex>:data:<hex>:tag:<hex>]`.
- **AND** Variables con `type: 'default'` se almacenan en texto plano sin cambios.

#### Scenario: Variable Secret Ya Encriptada
- **WHEN** El usuario guarda un environment y una variable `secret` ya tiene formato `ENC[...]`.
- **THEN** El sistema no vuelve a encriptar (evita doble encriptación).

### Requirement: Desencriptación Transparente
El sistema debe desencriptar automáticamente valores encriptados al cargar el environment.

#### Scenario: Cargar Environment con Secrets
- **WHEN** El usuario abre un environment que contiene valores en formato `ENC[...]`.
- **THEN** El sistema detecta el formato encriptado.
- **AND** Desencripta cada valor usando la llave del proyecto.
- **AND** Presenta los valores desencriptados a la UI (transparente para el usuario).

#### Scenario: Llave de Desencriptación No Disponible
- **WHEN** El sistema intenta desencriptar un valor pero no encuentra la llave del proyecto.
- **THEN** Muestra un error claro indicando que falta la llave de desencriptación.
- **AND** El environment no se carga (para prevenir pérdida de datos al sobrescribir).

### Requirement: Gestión de Llaves por Proyecto
El sistema debe generar y almacenar automáticamente una llave de encriptación única por proyecto.

#### Scenario: Primera Encriptación en un Proyecto
- **WHEN** El usuario guarda por primera vez una variable `secret` en un proyecto.
- **THEN** El sistema genera una llave de encriptación derivada del path absoluto del proyecto.
- **AND** Almacena la llave ofuscada en `~/.j5request/globals.json`.
- **AND** Usa esa llave para encriptar el valor.

#### Scenario: Encriptaciones Subsecuentes
- **WHEN** El usuario guarda otra variable `secret` en el mismo proyecto.
- **THEN** El sistema reutiliza la llave existente del proyecto.

#### Scenario: Proyecto Movido de Ubicación
- **WHEN** El usuario mueve la carpeta del proyecto a otra ubicación y lo vuelve a abrir.
- **THEN** El sistema genera una nueva llave basada en el nuevo path.
- **AND** No puede desencriptar valores encriptados con la llave del path anterior.
- **AND** Muestra error indicando que la llave cambió (path del proyecto cambió).

### Requirement: Almacenamiento Seguro de Llaves
Las llaves de encriptación deben almacenarse de forma ofuscada en la configuración global.

#### Scenario: Almacenar Llave
- **WHEN** El sistema genera una llave para un proyecto.
- **THEN** Almacena la llave en `globals.json` bajo `_encryptionKeys[projectPath]`.
- **AND** La llave se almacena ofuscada (no en texto plano).

#### Scenario: Lectura de Llave
- **WHEN** El sistema necesita desencriptar un valor.
- **THEN** Lee la llave ofuscada de `globals.json`.
- **AND** Desofusca la llave antes de usarla para desencriptación.

### Requirement: Formato de Archivo Compatible
El formato de archivo debe permitir mezclar valores encriptados y en texto plano.

#### Scenario: Environment Mixto
- **WHEN** Un environment tiene variables `secret` y `default`.
- **THEN** Solo las variables `secret` tienen valores en formato `ENC[...]`.
- **AND** Las variables `default` permanecen en texto plano.
- **AND** El archivo JSON sigue siendo válido y parseable.

#### Scenario: Backwards Compatibility
- **WHEN** Se abre un environment creado antes de esta feature (sin valores encriptados).
- **THEN** El sistema lo carga normalmente sin intentar desencriptar.
- **AND** Al guardar, solo encripta nuevas variables marcadas como `secret`.

### Requirement: Validación de Integridad
El sistema debe validar que los valores encriptados no han sido alterados.

#### Scenario: Valor Encriptado Válido
- **WHEN** El sistema desencripta un valor con formato correcto.
- **THEN** AES-GCM valida el authentication tag automáticamente.
- **AND** Si la validación pasa, retorna el valor desencriptado.

#### Scenario: Valor Encriptado Corrupto
- **WHEN** Un valor encriptado fue modificado manualmente o está corrupto.
- **THEN** La validación del authentication tag falla.
- **AND** El sistema muestra error indicando que el valor fue alterado o está corrupto.
- **AND** No permite cargar el environment (prevenir uso de datos corruptos).

### Requirement: Solo Environments Locales
Solo los environment files locales del proyecto deben encriptarse, no los globals.

#### Scenario: Guardar Variable Secret en Globals
- **WHEN** El usuario agrega una variable `type: 'secret'` a Globals.
- **THEN** El sistema **NO** encripta el valor (Globals están protegidos por permisos del SO).
- **AND** Muestra una advertencia recomendando usar un environment local en su lugar.

#### Scenario: Guardar Variable Secret en Environment Local
- **WHEN** El usuario agrega una variable `type: 'secret'` a un environment local del proyecto.
- **THEN** El sistema encripta el valor automáticamente.
