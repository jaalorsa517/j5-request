# Capability: Workspace Tabs

## Purpose
Gestionar múltiples contextos de petición simultáneamente dentro de la aplicación, permitiendo al usuario trabajar en varias solicitudes en paralelo sin perder el estado.

## Requirements

### Requirement: Gestión de Pestañas
El sistema debe permitir gestionar múltiples pestañas de solicitud dentro de la misma ventana de la aplicación.

#### Scenario: Crear nueva pestaña
- **GIVEN** el usuario está en la vista principal
- **WHEN** el usuario hace clic en el botón de agregar nueva pestaña (+)
- **THEN** se crea una nueva pestaña con una solicitud vacía por defecto
- **AND** la nueva pestaña se marca como activa
- **AND** el editor muestra el estado inicial vacío

#### Scenario: Cerrar pestaña activa
- **GIVEN** hay múltiples pestañas abiertas
- **WHEN** el usuario cierra la pestaña activa actual
- **THEN** la pestaña se elimina de la lista
- **AND** la pestaña inmediatamente anterior (o posterior si es la primera) se selecciona como activa
- **AND** el editor actualiza su contenido para reflejar la nueva pestaña activa

#### Scenario: Cerrar pestaña inactiva
- **GIVEN** hay múltiples pestañas abiertas
- **WHEN** el usuario cierra una pestaña que no está activa
- **THEN** la pestaña se elimina de la lista
- **AND** la pestaña activa actual permanece seleccionada sin cambios en el editor

#### Scenario: Cambiar de pestaña
- **GIVEN** hay al menos dos pestañas creadas (Pestaña A y Pestaña B)
- **WHEN** el usuario hace clic en la Pestaña B (inactiva)
- **THEN** la Pestaña B se marca como activa
- **AND** la Pestaña A se marca como inactiva
- **AND** el editor carga y muestra los datos (URL, cuerpo, cabeceras) correspondientes a la Pestaña B

### Requirement: Persistencia de Estado de Pestaña
Cada pestaña debe mantener su propio estado independiente de solicitud y respuesta mientras la aplicación esté en ejecución.

#### Scenario: Preservación de datos al cambiar
- **GIVEN** la Pestaña A tiene una URL "http://api.test/users" y la Pestaña B tiene "http://api.test/posts"
- **WHEN** el usuario cambia de Pestaña A a Pestaña B y luego regresa a Pestaña A
- **THEN** la URL mostrada en el editor debe ser "http://api.test/users"
- **AND** cualquier cambio no guardado en el cuerpo o cabeceras de la Pestaña A debe mantenerse intacto
