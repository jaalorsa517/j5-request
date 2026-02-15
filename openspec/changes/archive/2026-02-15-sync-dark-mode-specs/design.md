## Context

La aplicación requiere soportar temas visuales (Claro y Oscuro) para mejorar la experiencia de usuario en diferentes condiciones de iluminación. Esta funcionalidad ya ha sido implementada en el código base y este documento detalla el diseño técnico adoptado para asegurar su consistencia y mantenimiento.

## Decisions

### 1. Gestión de Estado Global con Pinia
Se utiliza un store de Pinia (`useThemeStore`) para manejar el estado del tema actual.
- **Rationale**: Pinia es el estándar de gestión de estado en Vue 3, permitiendo reactividad y fácil acceso desde cualquier componente.
- **Alternative**: Usar `provide/inject` nativo de Vue, pero Pinia ofrece mejor devtools y estructura.

### 2. Persistencia en LocalStorage
La preferencia del usuario se guarda en `localStorage` bajo la clave `theme`.
- **Rationale**: Permite mantener la elección del usuario entre sesiones sin requerir backend.
- **Fallback**: Si no hay valor guardado, se detecta la preferencia del sistema operativo mediante `window.matchMedia('(prefers-color-scheme: dark)')`.

### 3. Aplicación de Estilos vía Atributo Data
El tema se aplica estableciendo el atributo `data-theme="dark"` o `data-theme="light"` en el elemento raíz `document.documentElement`.
- **Rationale**: Permite definir variables CSS globales que cambian dinámicamente según este atributo (e.g., `[data-theme="dark"] { --bg-color: #000; }`). Es más performante que cambiar clases en múltiples elementos.

### 4. Uso de Tipos TypeScript
Se definen tipos estrictos (`type Theme = 'dark' | 'light'`) en lugar de strings sueltos.
- **Rationale**: Evita errores de tipeo y mejora el autocompletado.

## Risks / Trade-offs

- **Flicker al cargar**: Puede haber un breve parpadeo si el script de carga del tema se ejecuta después del renderizado inicial.
  - *Mitigación*: El store se inicializa inmediatamente y aplica el tema antes del montaje completo de la app.
- **Sincronización con el SO**: Si el usuario cambia el tema del SO mientras la app está abierta, la app no reacciona automáticamente si el usuario ya fijó una preferencia manual.
  - *Mitigación*: Aceptable, la preferencia explícita del usuario tiene prioridad.
