## 1. Auditoría de Componentes

- [x] 1.1 Revisar `MainLayout.vue` para identificar estilos hardcodeados en el modal de "New Request".
- [x] 1.2 Revisar `EnvironmentManagerModal.vue` para identificar estilos hardcodeados.

## 2. Implementación de Variables CSS

- [x] 2.1 Refactorizar el CSS de `MainLayout.vue` (modal section) para usar `--bg-modal` y `--text-primary`.
- [x] 2.2 Refactorizar el CSS de `EnvironmentManagerModal.vue` para usar variables de tema en fondos, textos y bordes.
- [x] 2.3 Asegurar que los inputs dentro de los modales usen `--input-bg`, `--input-border` y `--text-primary`.
- [x] 2.4 Verificar que los botones de acción en modales tengan contraste correcto en hover.

## 3. Verificación

- [x] 3.1 Abrir modal "New Request" en tema Oscuro y Claro para verificar visualización.
- [x] 3.2 Abrir modal "Manage Environments" en tema Oscuro y Claro para verificar visualización.
