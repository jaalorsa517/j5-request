# unit-testing-infrastructure

## Purpose
Specifies the infrastructure required to run unit tests in the project, including runners, configuration, and scripts.

## Requirements

### Requirement: Infraestructura de Pruebas con Vitest
El sistema DEBE tener Vitest instalado y configurado para ejecutar pruebas TypeScript en el entorno del proyecto.

#### Scenario: Ejecución de pruebas exitosa
- **WHEN** se ejecuta el comando de prueba configurado
- **THEN** Vitest inicia la ejecución y reporta el estado de las pruebas encontradas sin errores de configuración

### Requirement: Scripts de NPM para Pruebas
El archivo `package.json` DEBE incluir scripts para ejecutar las pruebas una vez y en modo observador (watch).

#### Scenario: Comando test
- **WHEN** el usuario ejecuta `pnpm test`
- **THEN** se ejecutan todas las pruebas del proyecto una sola vez

#### Scenario: Comando test watch
- **WHEN** el usuario ejecuta `pnpm test:watch` (o script equivalente)
- **THEN** Vitest inicia en modo watch, esperando cambios en los archivos

### Requirement: Reportes de Cobertura de Código
El sistema de pruebas DEBE ser capaz de generar reportes detallados de cobertura de código utilizando el proveedor v8.

#### Scenario: Ejecución de pruebas con cobertura
- **WHEN** el usuario ejecuta el comando `pnpm run test:coverage`
- **THEN** se ejecutan todas las pruebas unitarias
- **AND** se genera un reporte de cobertura en la carpeta `coverage/`
- **AND** se muestra un resumen de la cobertura en la consola

### Requirement: Cumplimiento de Umbrales de Calidad
El sistema DEBE imponer umbrales mínimos de cobertura del 90% para líneas, ramas, funciones y sentencias.

#### Scenario: Cobertura insuficiente
- **WHEN** se ejecutan las pruebas y alguna métrica de cobertura es inferior al 90%
- **THEN** el proceso de pruebas finaliza con un código de error (fallo)
- **AND** se informa al usuario qué umbrales no se cumplieron

#### Scenario: Cobertura suficiente
- **WHEN** se ejecutan las pruebas y todas las métricas de cobertura son iguales o superiores al 90%
- **THEN** el proceso de pruebas finaliza exitosamente

### Requirement: Alcance de Cobertura Global
El sistema de medición de cobertura DEBE incluir todos los archivos fuente del proyecto (`src/**`) excepto aquellos explícitamente excluidos por ser puntos de entrada o configuración pura.

#### Scenario: Reporte completo incluyendo frontend
- **WHEN** se ejecuta el comando `pnpm run test:coverage`
- **THEN** el reporte de cobertura incluye archivos de `src/renderer`, `src/shared` y `src/main` (fuera de services)
- **AND** los archivos de configuración (`*.config.ts`) y puntos de entrada (`main.ts`) NO aparecen en el reporte

### Requirement: Persistencia de Umbrales Altos
Los umbrales de cobertura calidad (90%) se DEBEN aplicar sobre el alcance global expandido, aunque esto provoque fallos en la ejecución de pruebas a corto plazo.

#### Scenario: Fallo esperado por baja cobertura global
- **WHEN** se ejecuta el comando `test:coverage` con el nuevo alcance
- **IF** la cobertura global de las nuevas áreas (renderer, etc.) es baja
- **THEN** el comando falla reportando que no se alcanza el 90%
- **BUT** se genera el reporte completo mostrando qué falta por probar
