## Contexto

J5-request es una aplicación "local-first" y "file-based". La gestión de versiones es externa (Git), pero actualmente el usuario debe salir de la aplicación para hacer commits o pushes. Para la Fase 3, integraremos estas operaciones directamente en la UI para mejorar la experiencia de desarrollador (DX) y fomentar la filosofía "API-as-Code".

## Objetivos / No Objetivos

**Objetivos:**
- Permitir ver el estado del repositorio (archivos modificados, staged, untracked).
- Realizar operaciones básicas: Stage, Unstage, Commit, Push, Pull, Fetch.
- Cambiar de rama (Switch branch) y crear nuevas ramas.
- Ver diferencias visuales (Diff) de los archivos modificados.
- Soportar múltiples repositorios si el workspace tiene varios proyectos.

**No Objetivos:**
- Gestión compleja de Git (Rebase interactivo, Cherry-pick, Bisect).
- Gestión de remotos (añadir/quitar remotos se hará por terminal o configuración avanzada, aunque el push/pull usará el `origin` por defecto).
- Visor de historial de commits completo (Graph view) en esta primera iteración (solo lo necesario para operaciones actuales).

## Decisiones

### 1. Arquitectura: Main Process vs Renderer
Usaremos `simple-git` ejecutándose exclusivamente en el **Main Process** de Electron.
- **Por qué**: Evitar problemas de contexto de seguridad y acceso a sistema de archivos en el Renderer.
- **Comunicación**: Se expondrán handlers IPC (`git:get-status`, `git:commit`, `git:push`, etc.).

### 2. UI de Control de Código
Se implementará un panel lateral dedicado (similar a VS Code "Source Control").
- Lista de cambios agrupados por repositorio (si hay múltiples).
- Botones de acción rápida en cada archivo (stage/revert) y en la cabecera (commit, sync).

### 3. Visualización de Diffs
Utilizaremos la vista de diferencias nativa de **Monaco Editor** (`MonacoDiffEditor`).
- Cuando el usuario haga clic en un archivo modificado en el panel de Git, se abrirá una pestaña especial mostrando el "Original" (HEAD) vs "Actual" (Disco).

### 4. Gestión de Estado
Usaremos un store de Pinia `useGitStore` que mantendrá el estado reactivo de los repositorios detectados.
- Se actualizará mediante "polling" inteligente (cuando la ventana recupera foco) y watch del sistema de archivos, o manualmente con un botón de refresco.

## Riesgos / Trade-offs

- **Riesgo**: El rendimiento de `git status` en repositorios gigantes podría ser lento.
  - *Mitigación*: Ejecutar operaciones de git de manera asíncrona y no bloquear la UI. Poner timeouts.
- **Trade-off**: No soportar credenciales complejas (SSH con passphrase, 2FA sin agente) en la primera versión.
  - *Mitigación*: Asumir que el usuario tiene configurado credenciales en su entorno (SSH agent o Credential Helper). Si falla la autenticación, mostrar error claro pidiendo configurar credenciales en terminal.
