## 1. Implementación Básica en Git Service

- [ ] 1.1 Localizar el método `getFileContent` y afines dentro de `src/main/services/GitService.ts`.
- [ ] 1.2 Encapsular de forma segura la llamada correspondiente al binario de git (`git show HEAD...`) que extrae el contenido.
- [ ] 1.3 Agregar captura general (catch) y validar que el string de error provisto por el proceso hijo haga match con "bad object HEAD", "invalid object name HEAD", u oraciones contextuales similiares en el comando arrojado.
- [ ] 1.4 Manejar el escenario retornando string vacío `""` al servicio si es la versión `HEAD` la solicitada, indicando llanamente que en un repositorio nuevo un HEAD base en contexto diff representa el vacío.
- [ ] 1.5 Revisar el método que hace checkout/reset para prevenir escenarios similares con nombres inválidos si resulta beneficioso, aunque la prioridad del Diff es el foco fundamental de momento.

## 2. Coordinación y Testing

- [ ] 2.1 Inspeccionar IPC `git:get-file-content` en `src/main/ipc.ts` cerciorándose de que ya no recibe excepciones erráticas sobre HEAD.
- [ ] 2.2 Crear o corregir test automáticos unitarios localizados en `src/test/main/services/GitService.test.ts` (especijalmente mocking el shell/exec con un arrojamiento de `fatal: bad object HEAD`).
- [ ] 2.3 Probar compilación validando que un repo sin commits que es inicializado en la vista local pueda abrir el panel visualizador de diferencias de archivos non-staged/added.
