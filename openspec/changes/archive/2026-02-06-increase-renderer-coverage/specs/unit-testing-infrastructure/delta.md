# Delta Spec: Unit Testing Infrastructure Extension (Renderer)

## ADDED Requirements

### Requirement: Pruebas de Componentes Vue
El sistema de pruebas DEBE permitir la ejecución de pruebas unitarias para componentes Vue (.vue), soportando el montaje de componentes, interacción con el DOM simulado y verificación de reactividad.

#### Scenario: Montaje y renderizado básico
- **WHEN** se ejecuta una prueba unitaria para un componente Vue
- **THEN** el componente se monta correctamente en un DOM virtual (jsdom/happy-dom)
- **AND** las aserciones sobre el contenido renderizado funcionan

### Requirement: Mocking de Contexto Electron
El entorno de pruebas DEBE proporcionar mocks automáticos para las APIs de Electron expuestas al renderer (ej. `window.electron`), evitando errores de referencia durante la ejecución.

#### Scenario: Acceso a API de Electron en tests
- **WHEN** un componente o store intenta acceder a `window.electron` durante un test
- **THEN** la llamada es interceptada por un mock preconfigurado
- **AND** no se produce un error de ejecución por `undefined`

### Requirement: Pruebas de Gestión de Estado (Pinia)
Los stores de Pinia DEBEN ser testables de forma aislada, permitiendo verificar acciones, getters y cambios de estado sin necesidad de montar la aplicación completa.

#### Scenario: Ejecución de acción en Store
- **WHEN** se invoca una acción en un store de Pinia dentro de un test
- **THEN** el estado del store se actualiza según la lógica esperada
- **AND** los side-effects (como llamadas a APIs mockeadas) ocurren correctamente
