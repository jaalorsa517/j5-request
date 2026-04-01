## Context

La aplicación actualmente procesa datos JSON en el hilo del renderizador para la visualización y en el proceso principal para la importación. Esto causa degradación del rendimiento cuando los archivos superan ciertos umbrales (aprox. 1MB para UI, 5MB para importación). El uso de Monaco Editor con archivos grandes también satura la memoria debido a sus características de validación y análisis.

## Goals / Non-Goals

**Goals:**
- Desacoplar el procesamiento de JSON del hilo de la UI.
- Implementar una estrategia de carga por bloques para archivos grandes.
- Configurar Monaco Editor para maximizar el rendimiento con contenidos extensos.

**Non-Goals:**
- Cambiar el formato de persistencia de las peticiones (se mantiene JSON).
- Implementar una base de datos local compleja (tipo SQLite) para las respuestas.

## Decisions

### 1. Delegación al Worker
- **Decisión**: Utilizar el proceso utilitario (worker) para todo parseo de JSON superior a 500KB.
- **Razón**: El worker corre en un proceso separado, lo que garantiza que la interfaz de usuario se mantenga fluida incluso durante operaciones intensivas de CPU.
- **Alternativa**: Usar Web Workers en el renderizador. Se descartó para centralizar la lógica de procesamiento pesado en el proceso utilitario de Electron que ya tiene acceso a APIs de Node.

### 2. Virtualización en Monaco Editor
- **Decisión**: Desactivar dinámicamente el `semanticHighlighting` y el `wordWrap` para archivos > 1MB.
- **Razón**: Estas características son las que más consumen recursos en Monaco. Al desactivarlas, el scroll y la renderización se vuelven casi instantáneos.

### 3. Estrategia de Importación por Bloques
- **Decisión**: Usar flujos de lectura (`fs.createReadStream`) en el proceso principal y enviar fragmentos al worker para el parseo de colecciones grandes (Postman/OpenAPI).
- **Razón**: Evita cargar archivos de decenas de megabytes completos en la memoria RAM.

## Risks / Trade-offs

- **[Riesgo] Overhead de IPC** → La transferencia de objetos grandes entre procesos puede ser lenta. **[Mitigación]** Usar `JSON.stringify` en el worker y pasar la cadena, o usar `Transferable objects` si se manejan Buffers.
- **[Trade-off] Pérdida de características de edición** → Al optimizar Monaco para archivos grandes, el usuario pierde validación en tiempo real. **[Mitigación]** Añadir un botón manual de "Validar JSON" para estos casos.
