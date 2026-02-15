## 1. Verificación de Tema (Theming)

- [x] 1.1 Verificar que `useThemeStore` implemente correctamente la lógica de detección de preferencia de sistema (`prefers-color-scheme`).
- [x] 1.2 Verificar que el cambio de tema persista en `localStorage` y se recupere al iniciar.
- [x] 1.3 Verificar que el atributo `data-theme` se aplique correctamente al documento raíz al cambiar el estado.
- [x] 1.4 Validar que los componentes principales (`MainLayout`, `RequestTabBar`) respondan visualmente al cambio de variables CSS.

## 2. Estandarización de Tipos

- [x] 2.1 Escanear el directorio `src/renderer` y `src/shared` en busca de definiciones `interface` que representen estructuras de datos.
- [x] 2.2 Refactorizar interfaces identificadas a `type` (e.g., `interface User { name: string }` -> `type User = { name: string }`).
- [x] 2.3 Asegurar que `interface` solo se use para contratos de implementación o extensión de clases si es necesario.

## 3. Verificación de Pestañas

- [x] 3.1 Revisar la implementación de `RequestTabBar` y asegurar consistencia con el comportamiento esperado (selección activa, cierre).
- [x] 3.2 Verificar que la creación de nuevas pestañas inicialice correctamente el estado en el store.
