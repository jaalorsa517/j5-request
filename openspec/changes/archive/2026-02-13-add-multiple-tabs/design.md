## Contexto
La aplicación actual gestiona un único estado de petición activa. Para mejorar la productividad, estamos introduciendo una interfaz con pestañas. Esto requiere un cambio fundamental de un modelo de petición singleton a un modelo basado en colecciones donde coexisten múltiples contextos de petición, pero solo uno está activo a la vez. La UI debe invocar el contexto apropiado al cambiar de pestaña.

## Objetivos / No-Objetivos
**Objetivos:**
- Implementar un tipo `RequestTab` para encapsular el estado de la petición (ID, etiqueta, método, URL, cuerpo, cabeceras).
- Crear un `WorkspaceStore` (o actualizar `RequestStore`) para gestionar la lista de pestañas abiertas y el `activeTabId`.
- Desarrollar un componente UI para la barra de pestañas permitiendo creación, eliminación y selección de pestañas.
- Asegurar que el Editor Monaco y otros campos de entrada se vinculen al estado de la pestaña *activa*.

**No-Objetivos:**
- Persistir pestañas abiertas tras refrescar el navegador (para esta iteración inicial, aunque la arquitectura debería permitirlo).
- Reordenamiento de pestañas mediante arrastrar y soltar.
- Agrupación de pestañas en carpetas.

## Decisiones
### 1. Patrón de Gestión de Estado
Refactorizaremos el `useRequestStore` existente. En lugar de propiedades planas para `url`, `method`, etc., el store contendrá:
```typescript
type RequestTab = {
  id: string;
  name: string; // ej. "GET /users" o "Sin Título"
  request: RequestState; // La estructura existente
  response?: ResponseState;
  isDirty: boolean;
};

state: {
  tabs: RequestTab[];
  activeTabId: string;
}
```
Las acciones incluirán `addTab()`, `closeTab(id)`, `setActiveTab(id)`.

### 2. Arquitectura de Componentes
- **Componente TabBar**: Muestra la lista de `tabs`. Resalta `activeTabId`. Maneja eventos de click para cambiar y cerrar.
- **Main Layout**: Escucha `activeTabId`. El componente `RequestEditor` recibirá los datos de la petición *activa* como props o los computará del store basado en el ID.

### 3. Sincronización del Editor
Al cambiar de pestaña, la instancia del Editor Monaco debe actualizar su valor. Usaremos un watcher en `activeTabId` o el cuerpo de la petición activa computada para hacer `setValue` en el modelo del editor, asegurando que el editor refleje el contenido de la pestaña actual.

## Riesgos / Compromisos
- **Uso de Memoria**: Almacenar cuerpos de respuesta completos para muchas pestañas podría incrementar el uso de memoria. Podríamos necesitar implementar una estrategia para mantener solo metadatos ligeros para pestañas inactivas si esto se vuelve un problema, pero por ahora, lo mantendremos simple bajo la asunción de un uso razonable.
- **Complejidad de Reactividad**: Asegurar reactividad profunda (ej. modificar una cabecera en Pestaña A mientras Pestaña B está activa — aunque esto no debería pasar en la UI) y actualizaciones correctas de UI al cambiar. El sistema de reactividad de Vue debería manejar esto si referenciamos la pestaña activa correctamente.
