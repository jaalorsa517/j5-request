## 1. Backend Implementation

- [x] 1.1 Actualizar `readDirRecursive` en `FileSystemService.ts` para filtrar por extensión `.j5request`.
  - Debe ignorar `.json` y otros archivos.
  - Debe seguir ignorando `node_modules` y directorios ocultos (comportamiento existente).

## 2. Frontend Implementation

- [x] 2.1 Actualizar `createRequest` en `src/renderer/stores/file-system.ts`.
  - Debe asignar la extensión `.j5request` si no está presente.
  - El nombre interno de la petición (propiedad `name` del objeto JSON) debe estar limpio de extensión.

## 3. Verification

- [x] 3.1 Verificar manualmente que al recargar el directorio, solo se ven archivos `.j5request`.
- [x] 3.2 Crear una nueva petición y verificar que se guarda con la extensión nueva en disco.
