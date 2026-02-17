# Spec: Core Foundation (Delta)

## ADDED Requirements

### Requirement: Definición de Tipos
El código debe seguir convenciones estrictas de TypeScript para la definición de estructuras de datos.

#### Scenario: Uso de Type vs Interface
- **WHEN** Se define la forma de un objeto o estructura de datos.
- **THEN** Se debe utilizar `type` y no `interface`.
- **AND** `interface` se reserva exclusivamente para definir contratos de clases o implementación de métodos (similar a Java/C#).
