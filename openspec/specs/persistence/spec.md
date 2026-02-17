# Spec: Persistencia de Peticiones

## Purpose
Asegurar que las peticiones se guarden y carguen correctamente desde el sistema de archivos, manejando la serialización de objetos reactivos.

## Requirements

### Requirement: Guardar Petición
El sistema debe permitir guardar una petición sin errores de serialización, incluso si el objeto de origen es reactivo.

#### Scenario: Guardar una petición modificada
- **WHEN** el usuario modifica una petición y hace clic en Guardar
- **THEN** el sistema debe escribir el archivo en disco exitosamente
- **ENTONCES** no debe aparecer el error "An object could not be cloned"
