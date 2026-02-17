1. Descripción del Proyecto

J5-request es un cliente de consumo de APIs multiplataforma, construido con Electron, Vue y TypeScript, diseñado bajo la filosofía de "API-as-Code". A diferencia de los clientes tradicionales que dependen de nubes propietarias o formatos de archivo gigantes e ilegibles, J5-request descompone las colecciones en archivos individuales, minimalistas y altamente legibles por humanos.

La aplicación está pensada para equipos de desarrollo que ya utilizan Git como su única fuente de verdad, permitiendo que la documentación y las pruebas de la API vivan, se versionen y se fusionen dentro del mismo repositorio del código fuente, sin necesidad de cuentas externas ni sincronizaciones en la nube.

2. Objetivo General

Proveer una herramienta de escritorio ligera y robusta que permita a los desarrolladores gestionar, probar y compartir peticiones HTTP de forma colaborativa, utilizando el flujo de trabajo de Git para la sincronización del equipo, garantizando la privacidad de los datos y eliminando la fricción de los conflictos de fusión (merge conflicts) en las colecciones.
Objetivos Específicos:

    Desacoplar la persistencia: Guardar cada petición en una especificación OpenAPI.

    Soberanía de Datos: Eliminar el requerimiento de "Login" o "Cloud Sync", dejando que el usuario decida dónde y cómo hospedar sus datos.

    Interoperabilidad Total: Permitir la transición fluida desde otras herramientas mediante importadores de OpenAPI, Postman y cURL.

    Extensibilidad en TS: Ofrecer un entorno de scripting para pre/post-peticiones basado puramente en TypeScript, aprovechando el conocimiento del desarrollador.

## Importar Requests

J5-Request soporta la importación de requests desde múltiples formatos externos, facilitando la transición y reutilización de recursos existentes.

### Formatos Soportados

- **cURL**: Detecta y convierte comandos cURL (`curl -X POST ...`). Soportado: método, URL, headers, body (JSON y raw).
- **OpenAPI 3.x**: Importa especificaciones completas (JSON o YAML). Soporta: endpoints, métodos, headers y parámetros.
- **Postman Collection v2.1**: Importa colecciones exportadas en formato JSON.
- **Insomnia Export**: Importa colecciones exportadas en formato JSON/YAML.
- **JavaScript Fetch**: Detecta llamadas `fetch(...)` y extrae la configuración.
- **PowerShell**: Detecta scripts usando `Invoke-WebRequest` o `Invoke-RestMethod`.

### Cómo Utilizar

1. **Abrir Importador**: Haz clic en el botón "Import" en la barra lateral izquierda.
2. **Pegar Contenido**: Pega el código o texto en la pestaña "Pegar". El formato se detectará automáticamente.
3. **Seleccionar Archivo**: Sube un archivo JSON/YAML en la pestaña "Archivo".
### Ejemplos

**cURL**
```bash
curl -X POST https://api.example.com/users -H "Content-Type: application/json" -d '{"name": "John"}'
```

**Fetch**
```javascript
fetch('https://api.example.com/users', {
  method: 'POST',
  body: JSON.stringify({ name: 'John' })
})
```

> **Nota**: Actualmente no se importan scripts de prueba (Pre-request/Test) ni variables de entorno complejas de Postman/Insomnia. Solo se migra la definición de la petición HTTP.
