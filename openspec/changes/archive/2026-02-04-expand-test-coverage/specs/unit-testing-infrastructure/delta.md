# Delta Spec: Unit Testing Infrastructure Extension

## ADDED Requirements

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
