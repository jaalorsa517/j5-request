## 1. Configuración de electron-builder

- [x] 1.1 Actualizar `electron-builder.json5` para incluir la sección `publish` con el proveedor GitHub.
- [x] 1.2 Configurar los targets de Linux para generar `deb`, `rpm` y `pacman` adicionalmente a `AppImage`.
- [x] 1.3 Asegurar que los patrones de nombres de artefactos (`artifactName`) son consistentes entre plataformas.

## 2. Implementación de Workflows

- [x] 2.1 Crear el archivo `.github/workflows/release.yml`.
- [x] 2.2 Definir la matriz de construcción (`ubuntu`, `windows`, `macos`).
- [x] 2.3 Configurar los pasos de instalación de dependencias con caché para `pnpm`.
- [x] 2.4 Configurar los pasos de compilación y publicación usando los secretos de GitHub (`GH_TOKEN`).

## 3. Integración y Calidad

- [x] 3.1 Añadir paso de validación (`pnpm test` y linting) previo a la construcción en el workflow.
- [x] 3.2 Verificar que el workflow se activa correctamente al crear un tag `v*`.

## 4. Validación Final

- [x] 4.1 Realizar una ejecución de prueba del workflow (manualmente o con un tag beta).
- [x] 4.2 Confirmar que todos los binarios (EXE, DMG, DEB, RPM, Pacman, AppImage) se suben correctamente a la release de GitHub.
