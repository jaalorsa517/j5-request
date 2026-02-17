## Context

La aplicación ya dispone de la infraestructura necesaria para soportar temas visuales (store de Pinia y variables CSS), pero la interfaz actual hardcodea ciertos valores de color o asume un fondo oscuro, lo que rompe la visualización en modo claro. Además, no se expone el control de cambio de tema al usuario final, dependiendo de hacks o consola para cambiarlo.

## Goals / Non-Goals

**Goals:**
- Implementar un botón de fácil acceso para alternar el tema (Sol/Luna) en la UI principal.
- Identificar y corregir todas las variables CSS "hardcodeadas" en los componentes, reemplazándolas por variables semánticas del tema.
- Asegurar que el contraste y legibilidad sean correctos en ambos modos (Claro y Oscuro).

**Non-Goals:**
- Implementar sistema de temas personalizados o paletas de colores configurables más allá de Claro/Oscuro.
- Cambiar la estructura del layout general de la aplicación.

## Decisions

### 1. Ubicación del Toggle
El botón de cambio de tema se ubicará en la **Activity Bar** (barra lateral izquierda de iconos), en la parte inferior.
- **Rationale**: Es un patrón común en editores de código (como VS Code) y mantiene la funcionalidad global accesible sin ocupar espacio en el área de trabajo.

### 2. Uso de Variables CSS Semánticas
Se auditará el archivo `src/renderer/style.css` y los `<style>` de los componentes para asegurar que todos los colores usen variables (e.g., `var(--bg-primary)`, `var(--text-secondary)`).
- **Decisión**: Se eliminarán los códigos hexadecimales directos en estilos scoped de componentes críticos como `RequestTabBar` y `RequestPanel`.
- **Naming Convention**: `bg-*` para fondos, `text-*` para textos, `border-*` para bordes.

### 3. Iconografía
Se usarán emojis simples (☀️/🌙) temporalmente o iconos SVG si ya existen en el sistema, para minimizar dependencias externas.
- **Rationale**: Simplicidad y consistencia con los botones existentes.

## Risks / Trade-offs

- **Regresión Visual**: Al tocar variables globales, podríamos afectar componentes que accidentalmente se veían bien.
  - *Mitigación*: Verificación visual manual de las vistas principales (Explorer, Request, Response, Git).
