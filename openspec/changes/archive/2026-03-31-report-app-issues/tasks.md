## 1. Modificación de la Interfaz

- [x] 1.1 Añadir el botón "Reportar un problema" en `AboutModal.vue` debajo de la sección de actualizaciones.
- [x] 1.2 Aplicar estilos coherentes al nuevo botón (estilo secundario o enlace con icono).
- [x] 1.3 Implementar la lógica para construir la URL de GitHub Issues con parámetros dinámicos (título y cuerpo pre-poblados).

## 2. Integración con el Proceso Principal

- [x] 2.1 Asegurar que la función `openReportIssue` en el frontend llame correctamente a `window.electron.app.openExternal`.
- [x] 2.2 Verificar que la URL generada incluya correctamente la versión de la aplicación obtenida de `appInfo`.

## 3. Validación y Pruebas

- [x] 3.1 Probar que al hacer clic en el botón se abre el navegador predeterminado.
- [x] 3.2 Confirmar que la página de GitHub Issues carga con el título "[Bug] Reportado desde vX.Y.Z" o similar.
- [x] 3.3 Verificar que el cuerpo del issue contiene la información básica necesaria para el diagnóstico.
