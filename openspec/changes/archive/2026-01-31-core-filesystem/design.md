## Context
Actualmente, la aplicación no tiene capacidad de persistencia ni gestión de archivos. Necesitamos implementar el núcleo del sistema ("Core") que permita interactuar con el sistema de archivos local para gestionar colecciones y peticiones, cumpliendo con los requisitos de granularidad (RF-01) y formato amigable para Git (RNF-01).

## Goals / Non-Goals

**Goals:**
- Definir el esquema JSON para `J5Request` y `J5Collection`.
- Implementar `FileSystemService` en el proceso Main para operaciones I/O.
- Implementar un sistema de observación de archivos (`watcher`) para reflejar cambios externos.
- Crear una interfaz básica (Renderer) que muestre el árbol de archivos.

**Non-Goals:**
- Ejecución de peticiones HTTP (se hará en FASE 4).
- Gestión de ramas Git o operaciones de control de versiones (FASE 3).
- Edición avanzada de peticiones (Monaco Editor, etc.) - solo editor de texto básico o visor JSON por ahora.

## Decisions

### 1. Arquitectura IPC (Inter-Process Communication)
Utilizaremos el patrón de IPC bidireccional de Electron.
- **Main Process**: Tendrá un `FileSystemService` que usa `fs/promises` y `chokidar`.
- **Preload**: Expondrá métodos seguros `window.electron.fs`.
- **Renderer**: Usará un Store (Pinia) `fileSystemStore` que reaccione a eventos del main process.

### 2. Formato de Archivo (RNF-01)
Para garantizar el requisito de "Human-Readable" y minimizar conflictos de Git:
- Usaremos JSON con indentación de 2 espacios.
- Implementaremos una utilidad de serialización que ordene las claves alfabéticamente antes de escribir.
- Extensión de archivo: `.json` en carpetas con estructura específica. *Decisión: `.json` por simplicidad, validando schema al leer.*

`schema.ts`:
```typescript
interface J5Request {
  id: string; // UUID o derivado del nombre
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  body?: {
    type: 'json' | 'form-data' | 'url-encoded' | 'raw';
    content: string | Record<string, any>;
  };
}
```

### 3. Watching vs Polling
Usaremos `chokidar` en el proceso Main para observar cambios en el directorio abierto. Esto permitirá que si el usuario hace `git pull` externamente, la UI se actualice automáticamente.

## Risks / Trade-offs

- **Performance con carpetas grandes**: Leer `current directory` recursivamente puede ser lento si incluye `node_modules` o `.git`.
  - *Mitigación*: Ignorar explícitamente `.git`, `node_modules` y archivos ocultos en el watcher y reader.
- **Conflictos de escritura**: Si el usuario edita el archivo externamente mientras guarda en la app.
  - *Mitigación*: "Last write wins" por ahora.
