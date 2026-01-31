## 1. Requerimientos Funcionales (RF)

A. Gestión de Colecciones y Peticiones

    RF-01: Estructura de archivos granular: Las colecciones deben guardarse como carpetas físicas en el sistema de archivos. Cada petición debe ser un archivo individual (ej. .json) para evitar conflictos de merge en Git.

    RF-02: Editor de peticiones completo: Soporte para métodos HTTP (GET, POST, PUT, DELETE, PATCH, etc.), edición de Query Params, Headers y Body (JSON, Form-data, URL-encoded, Raw).

    RF-03: Renderizado de respuestas: Visualización de la respuesta con resaltado de sintaxis, búsqueda dentro del cuerpo de la respuesta y guardado de respuestas en disco.

    RF-04: Manejo de Entornos (Environments): * Crear variables globales y por entorno.

        Diferenciación de Secretos: Permitir marcar variables como "secretas" para que se guarden en un archivo local (.env.local) que el usuario pueda ignorar en Git de forma automática.

B. Interoperabilidad

    RF-05: Importación masiva: Soporte para importar colecciones de Postman (v2.1), Insomnia y especificaciones OpenAPI (Swagger) 3.0/3.1.

    RF-06: Soporte de cURL: "Pegar como petición" (importar un comando cURL) y "Copiar como cURL".

    RF-07: Exportación: Generar archivos OpenAPI a partir de una colección local.

C. Scripting y Automatización

    RF-08: Scripts de Ciclo de Vida: Ejecución de código TypeScript/JavaScript antes de la petición (Pre-request) y después (Post-response/Tests).

    RF-09: Encadenamiento de peticiones: Capacidad de capturar un valor de una respuesta (ej. un token) y setearlo automáticamente como variable de entorno para la siguiente petición.

## 2. Requerimientos No Funcionales (RNF)

A. Colaboración y Git

    RNF-01: Formato de archivo Human-Readable: El esquema de persistencia debe estar indentado y ordenado alfabéticamente de forma forzada para que, al añadir un header, el git diff solo muestre una línea de cambio.

    RNF-02: Flujo de trabajo con Git: Componentes visuales básicos para la gestión de Git (cambio rama, commit, push, pull, etc). El usuario debe tener la capacidad de gestionar todo el flujo Git desde la aplicación (revisar cambios, resolver conflictos, commit, push, etc). El aplicativo debe poder permitir múltiples proyectos Git en el mismo espacio de trabajo.

B. Rendimiento y Seguridad

    RNF-03: Gestión de grandes volúmenes de datos: Capacidad para abrir respuestas JSON de más de 10MB sin bloquear el hilo principal (usar Web Workers para el formateo).

    RNF-04: Bypass de CORS: Al ser Electron, las peticiones deben realizarse desde el proceso de Node.js (Main Process), no desde el navegador (Renderer), para evitar restricciones de CORS.

    RNF-05: Aislamiento de Scripts: Los scripts del usuario (RF-08) deben ejecutarse en un entorno seguro (Sandbox) para evitar que una colección maliciosa acceda al sistema de archivos del usuario.

C. UX/DX (Developer Experience)

    RNF-06: Modo Offline: La aplicación debe ser 100% funcional sin conexión a internet ni cuentas en la nube.

    RNF-07: Interfaz agnóstica: El diseño debe seguir patrones de IDE (como VS Code) con paneles colapsables y atajos de teclado configurables.