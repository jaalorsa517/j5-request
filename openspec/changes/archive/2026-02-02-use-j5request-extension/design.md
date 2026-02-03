## Context

La aplicación "J5 Request" maneja colecciones de peticiones HTTP. Actualmente, estas peticiones se persisten como archivos individuales con extensión `.json`. Esto causa que cualquier archivo JSON en el directorio de trabajo se interprete potencialmente como un archivo de petición, ensuciando la interfaz y mezclando archivos de configuración (como `package.json` o `tsconfig.json`) con los archivos de la aplicación.

## Goals / Non-Goals

**Goals:**
- Aislar los archivos de petición usando una extensión única `.j5request`.
- Filtrar el explorador de archivos para mostrar solo directorios y archivos `.j5request`.
- Asegurar que las nuevas peticiones se crean con la extensión correcta.

**Non-Goals:**
- Implementar un migrador automático de `.json` a `.j5request`. (Los usuarios deberán renombrar manualmente si desean migrar).
- Cambiar el formato interno del archivo (seguirá siendo JSON válido).

## Decisions

### 1. Extensión `.j5request`
Se eligió una extensión explícita y única para evitar coalisiones.
- **Alternativa**: Mantener `.json` y filtrar por contenido.
- **Razón**: Filtrar por contenido requiere leer cada archivo, lo cual es lento en directorios grandes. La extensión permite un filtrado rápido a nivel de `readdir`.

### 2. Formato Interno JSON
Aunque la extensión cambia, el contenido seguirá siendo texto JSON plano.
- **Razón**: Facilita la depuración manual y mantiene la simplicidad.

### 3. Filtrado en Backend
El filtrado de archivos se realizará en el servicio `FileSystemService` (proceso Main).
- **Razón**: Optimiza el payload enviado al renderer y centraliza la lógica de acceso a disco.

## Risks / Trade-offs

### [Risk] Archivos existentes invisibles
Los usuarios con colecciones existentes en `.json` dejarán de ver sus archivos en la UI.
- **Mitigación**: Se comunicará este cambio como un "Breaking Change". La solución es simple: renombrar los archivos.

### [Risk] Confusión en Save As
Si se implementa "Guardar Como" (futuro), el usuario podría olvidar la extensión.
- **Mitigación**: El sistema forzará la extensión automáticamente si no se provee.

## Migration Plan

1. Actualizar `FileSystemService.ts` para leer/escribir/filtrar `.j5request`.
2. Actualizar `file-system.ts` (store) para generar nombres con la nueva extensión.
3. Desplegar.
