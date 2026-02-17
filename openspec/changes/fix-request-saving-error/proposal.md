# Propuesta: Corregir Error al Guardar Petición

## Problema
Los usuarios experimentan el error "An object could not be cloned" al intentar guardar una petición. Esto ocurre porque el objeto `request` en el store es un Proxy reactivo de Vue, y Electron no puede serializarlo correctamente al enviarlo a través del IPC.

## Solución
Sanitizar el objeto `request` antes de enviarlo al proceso principal.
- Utilizar `JSON.parse(JSON.stringify(request))` para crear una copia profunda plana (POJO) y eliminar los proxies de Vue.
- Esto asegura que el objeto sea serializable y compatible con el algoritmo de clonado estructurado del IPC.

## Qué Cambia

## Capacidades

### Nuevas Capacidades
N/A (Corrección de Bug)

### Capacidades Modificadas
- `request-persistence`: Se asegura que el guardado de archivos funcione correctamente sin errores de clonado.

## Impacto

1.  **Frontend**: Modificar `RequestStore` (`src/renderer/stores/request.ts`) para clonar el objeto antes de llamar a `fs.writeFile`.
