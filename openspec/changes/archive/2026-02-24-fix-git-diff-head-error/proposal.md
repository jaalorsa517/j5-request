## Why

El usuario reportó que al intentar visualizar diferencias de archivos dentro de la UI del cliente Git integrado, está recibiendo el siguiente modal de error: "Error open diff: Error invokin remote method git:get-file-content. Error fatal nombre de objeto no válido HEAD". Este comportamiento usualmente sucede cuando en el repositorio actual aún no existe un commit base (es decir, recién se ejecutó un `git init`), provocando que `HEAD` apunte a una referencia inexistente en la base de datos de objetos, de tal forma que tratar de comparar contra él o leer contenido falla catastróficamente. 

Es imperativo mejorar la robustez del servicio de Git en el lado de Electron Main para manejar esta validación tempranamente y presentar caídas de modo agraciado (`graceful degradation`) antes de arrojar una excepción fatal.

## What Changes

1. **En los Servicios de Git (Backend/Main):** Se controlarán y encapsularán las excepciones provocadas por "invalid object name HEAD".
2. **Evaluación Temprana:** Se agregará lógica para comprobar, antes de intentar resolver el contenido de `HEAD`, si el repositorio se encuentra en estado inicial sin commits (donde HEAD no está bien resuelto).
3. **Manejo en Diff y Contenido:** Si el repositorio no tiene un commit apuntando a HEAD, las visualizaciones de diferencias interpretarán el archivo como 100% "Nuevo" (Agregado), mostrando en lugar del estado del diff original un archivo comparándose contra algo vacío.
4. **Manejo UI:** En lugar de lanzar una alerta fatal roja en la UI, el sistema tratará estas excepciones como operativas, posiblemente previniéndolo de crashear el editor y mostrándo un archivo añadido.

## Capabilities

### New Capabilities

- N/A

### Modified Capabilities

- `git-operations`: El requerimiento funcional y escenario referente a visualizar diferencias y cargar contenido debe especificar explícitamente el manejo del estado donde `HEAD` no se ha establecido todavía.

## Impact

- **`src/main/services/GitService.ts`**: Principal módulo impactado, donde se tendrán que reescribir bloques try/catch o hacer previas evaluaciones antes del diff/show.
- **`src/main/ipc.ts`**: Probablemente los handlers para `git:get-file-content` y relacionados que capturan la excepción reportada.
- No afectará esquemas de bases de datos y la UI será provista de una respuesta controlada y correcta (success true con contenido vacío de viejo).
