## Context

Los modales en la aplicación actualmente heredan estilos o tienen colores hardcodeados que no responden adecuadamente al cambio de tema global. Específicamente, fondos oscuros persisten en modo claro o textos claros sobre fondos claros, haciendo la interfaz inusable en ciertas configuraciones.

## Goals / Non-Goals

**Goals:**
- Asegurar que TODOS los modales (New Request, Environment Manager, etc.) usen variables CSS del tema.
- Garantizar contraste suficiente AA/AAA en textos dentro de modales tanto en modo claro como oscuro.

**Non-Goals:**
- Rediseñar los modales o cambiar su funcionalidad.
- Implementar nuevos modales.

## Decisions

### 1. Variables CSS Semánticas para Modales
Se utilizarán variables específicas ya existentes o se crearán nuevas si es necesario para el contexto modal:
- `--bg-modal`: Para el fondo del contenedor del modal.
- `--text-primary`: Para títulos y textos principales.
- `--input-bg`, `--input-border`: Para campos de formulario dentro del modal.
- `--bg-modal-overlay`: (Nueva si no existe) Para el fondo semitransparente que cubre la app.

### 2. Auditoría de Componentes
Se revisarán los siguientes archivos clave:
- `src/renderer/components/MainLayout.vue` (contiene el modal de "New Request").
- `src/renderer/components/EnvironmentManagerModal.vue`.
- Cualquier otro componente que implemente un overlay.

## Risks / Trade-offs

- **Risk**: Al cambiar el fondo del overlay, podría perderse el foco visual si no se elige la opacidad correcta para ambos temas.
  - *Mitigation*: Usar `rgba(0,0,0, 0.5)` suele funcionar bien para ambos, pero se puede evaluar una variable si se requiere un "velo" blanco en modo claro (aunque lo estándar es oscurecer el fondo siempre). Mieremos de usar una variable si el contraste no es suficiente.
