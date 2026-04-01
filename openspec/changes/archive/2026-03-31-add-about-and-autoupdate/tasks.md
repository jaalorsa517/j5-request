## 1. Configuración de Infraestructura

- [x] 1.1 Instalar la dependencia `electron-updater`.
- [x] 1.2 Configurar el proceso principal (`src/main/main.ts`) para inicializar el auto-updater.
- [x] 1.3 Implementar manejadores IPC para obtener la versión de la aplicación y el autor.
- [x] 1.4 Implementar manejador IPC para abrir URLs externas de forma segura con `shell`.

## 2. Interfaz de Usuario (Acerca de)

- [x] 2.1 Crear el componente `AboutModal.vue` en `src/renderer/components/`.
- [x] 2.2 Diseñar el modal siguiendo los design tokens del proyecto (superficies, tipografía).
- [x] 2.3 Integrar el botón de donación de PayPal dentro del modal `AboutModal.vue`.
- [x] 2.4 Actualizar `MainLayout.vue` para incluir el disparador y la visualización del modal "Acerca de".

## 3. Documentación y Donaciones

- [x] 3.1 Actualizar el archivo `README.md` con el distintivo (badge) oficial de donaciones de PayPal.
- [x] 3.2 Verificar que el enlace de donación en el README redirija correctamente al perfil del autor.

## 4. Validación y Pruebas

- [x] 4.1 Verificar que el diálogo muestra la versión correcta definida en `package.json`.
- [x] 4.2 Probar que el botón de donación abre el navegador predeterminado.
- [ ] 4.3 (Opcional) Simular un evento de actualización para verificar la lógica de notificación.
