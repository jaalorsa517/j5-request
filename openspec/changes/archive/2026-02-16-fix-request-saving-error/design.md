# Diseño: Corregir Error de Guardado

## Contexto
El error "An object could not be cloned" es típico en entornos Electron/Vue cuando se pasan objetos reactivos (Proxies) a través del IPC.

## Objetivos
- Eliminar el error de clonado al guardar.
- Asegurar integridad de los datos guardados.

## Decisiones

### 1. Sanitización de Datos
- Usar `JSON.parse(JSON.stringify(obj))` como método de "deep clone" y "un-proxy".
- Es seguro porque `J5Request` es una estructura JSON simple sin funciones ni referencias circulares.
- Se implementará directamente en `RequestStore` antes de la llamada a `window.electron.fs.writeFile`.

## Riesgos
- Performance: `JSON.parse(stringify)` puede ser lento para objetos gigantes, pero las peticiones HTTP suelen ser pequeñas (<1MB), así que es despreciable.
