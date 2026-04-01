## 1. Infraestructura de Procesamiento (Worker)

- [ ] 1.1 Implementar utilidad de detección de tamaño de JSON en el proceso principal.
- [ ] 1.2 Refactorizar el puente IPC para redirigir peticiones de parseo grandes al `worker.ts`.
- [ ] 1.3 Optimizar la serialización de datos entre el worker y el renderizador usando Buffers o fragmentación.

## 2. Optimización de Visualización (Monaco)

- [ ] 2.1 Implementar lógica en `MonacoEditor.vue` para detectar el tamaño del contenido y ajustar las opciones (`semanticHighlighting`, `wordWrap`, `minimap`).
- [ ] 2.2 Añadir un componente de advertencia de rendimiento ("Large file detected") en el visor de respuestas.
- [ ] 2.3 Implementar un modo de "Visualización Parcial" para archivos extremadamente grandes (> 5MB).

## 3. Refactorización de Importación

- [ ] 3.1 Migrar la lógica de importación de colecciones Postman/Insomnia al worker.
- [ ] 3.2 Implementar lectura por bloques (`fs.createReadStream`) en el servicio de archivos para importaciones masivas.
- [ ] 3.3 Añadir una barra de progreso real en el diálogo de importación para archivos grandes.

## 4. Validación y Rendimiento

- [ ] 4.1 Crear un set de pruebas con archivos JSON de 1MB, 5MB y 10MB.
- [ ] 4.2 Medir los tiempos de carga y el consumo de memoria antes y después de los cambios.
- [ ] 4.3 Verificar que no hay regresiones en importaciones pequeñas.
