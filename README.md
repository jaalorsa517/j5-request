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
