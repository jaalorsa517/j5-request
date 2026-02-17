# Especificación: Persistencia de Peticiones

## Requisitos MODIFICADOS

### Requisito: Guardar Petición
El sistema debe permitir guardar una petición sin errores de serialización, incluso si el objeto de origen es reactivo.

#### Escenario: Guardar una petición modificada
- **CUANDO** el usuario modifica una petición y hace clic en Guardar
- **ENTONCES** el sistema debe escribir el archivo en disco exitosamente
- **ENTONCES** no debe aparecer el error "An object could not be cloned"
