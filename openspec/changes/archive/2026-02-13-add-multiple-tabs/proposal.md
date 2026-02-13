## Por qué
Actualmente, la aplicación soporta trabajar en una sola petición a la vez. Los usuarios frecuentemente necesitan cambiar entre diferentes endpoints de API o comparar respuestas de múltiples peticiones. Sin soporte para pestañas, los usuarios pierden el contexto o tienen que guardar/cargar repetidamente, lo cual es ineficiente. Implementar múltiples pestañas se alinea con las expectativas estándar de un cliente API (ej. Postman, Insomnia) y mejora significativamente la productividad del desarrollador.

## Qué Cambia
Introduciremos una interfaz con pestañas en el área principal de peticiones.
- Se añadirá una **Barra de Pestañas** sobre el editor de peticiones.
- Los usuarios podrán **Crear** nuevas pestañas (por defecto una petición nueva/vacía).
- Los usuarios podrán **Cerrar** pestañas.
- Los usuarios podrán **Cambiar** entre pestañas, preservando el estado (URL, método, cabeceras, cuerpo, respuesta) de cada petición.
- El gestor de estado de la aplicación (Pinia) se actualizará para manejar un array de sesiones de peticiones activas en lugar de un único objeto de petición.

## Capacidades
### Nuevas Capacidades
- `workspace-tabs`: Gestiona el ciclo de vida y estado de múltiples pestañas de petición (creación, cambio, cierre, persistencia).

### Capacidades Modificadas
- `ui-request-layout`: El layout principal necesitará integrar el componente de barra de pestañas y ajustar la vista del editor de peticiones para mostrar el contenido de la pestaña activa.
- `ui-editor-monaco`: Asegurar que la instancia del editor actualice o intercambie correctamente el contenido cuando se cambian las pestañas.

## Impacto
- **Componentes Frontend**: Nuevo componente `TabBar`, actualizaciones en `MainLayout`.
- **Gestión de Estado**: Refactorización mayor del Store de Peticiones para soportar múltiples instancias.
- **Persistencia**: Las pestañas activas idealmente deberían restaurarse al reiniciar la app (consideración futura, pero se sienta la base aquí).
