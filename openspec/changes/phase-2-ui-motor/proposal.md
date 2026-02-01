## Why

La FASE 1 estableció los cimientos del sistema de archivos y el almacenamiento de peticiones. Ahora, para hacer la aplicación utilizable, necesitamos implementar la interfaz gráfica de usuario (GUI) que permita a los desarrolladores visualizar y editar estas peticiones.

El objetivo de la FASE 2 ("Motor UI") es dotar a la aplicación de un editor de código robusto (Monaco Editor) y paneles visuales para gestionar la configuración de la petición (URL, headers, body) y visualizar la respuesta. Esto es crítico para cumplir con los requisitos RF-02 y RF-03.

## What Changes

Se implementará el núcleo de la interfaz de edición y visualización:

1.  **Integración de Monaco Editor**: Se añadirá el editor Monaco para proporcionar una experiencia de edición de JSON de primer nivel (coloreado de sintaxis, validación, autocompletado) para el cuerpo de la petición y la respuesta.
2.  **Panel de Petición**: Interfaz para configurar Método HTTP, URL, Headers y Body.
3.  **Panel de Respuesta**: Visualización de estado (código, tiempo, tamaño) y cuerpo de la respuesta con resaltado de sintaxis.
4.  **Layout Principal**: Estructura responsiva (posiblemente split-pane) para acomodar la lista de archivos (Fase 1) junto con el área de trabajo (Fase 2).

## Capabilities

### New Capabilities

- `ui-editor-monaco`: Integración y configuración del editor Monaco para soporte de JSON y resaltado de sintaxis en áreas de request/response.
- `ui-request-layout`: Componentes visuales para la composición de la petición (Tabs para Body/Headers/Params, Barra de dirección).
- `ui-response-viewer`: Componentes visuales para la visualización de resultados (Status bar, JSON viewer de solo lectura).

### Modified Capabilities

- `filesystem-management`: Se actualizará levemente para integrarse con la nueva UI (ej. abrir un archivo carga su contenido en los nuevos stores de UI), pero el comportamiento core no cambia, es solo consumo.

## Impact

- **Frontend**: Introducción de nuevas dependencias (`monaco-editor`, `@guolao/vue-monaco-editor` o similar).
- **Stores**: Creación de nuevos stores de UI (ej. `useRequestStore`) para manejar el estado efímero de la edición (texto en el editor, tab seleccionada).
- **Performance**: Necesidad de manejar la carga perezosa (lazy loading) de Monaco Editor para no impactar el tiempo de inicio.
