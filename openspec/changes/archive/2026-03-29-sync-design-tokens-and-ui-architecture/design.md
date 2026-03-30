## Context

La aplicación ha evolucionado hacia un sistema de diseño más sofisticado basado en **Design Tokens** (variables CSS) y una identidad visual renovada. Sin embargo, esta evolución no se ha formalizado en las especificaciones, lo que crea una deuda técnica en la documentación y posibles inconsistencias para futuras implementaciones o agentes.

## Goals / Non-Goals

**Goals:**
- Formalizar el sistema de tokens semánticos en las especificaciones.
- Estandarizar el uso de activos de branding (iconos y colores oficiales).
- Documentar la infraestructura de la skill `interface-design` como parte del ecosistema del proyecto.

**Non-Goals:**
- Refactorizar todos los componentes de la aplicación en este cambio (solo se busca sincronizar especificaciones y asegurar que la base sea sólida).
- Implementar nuevos temas adicionales (ej. temas de colores personalizados).

## Decisions

### Uso de Tokens Semánticos
- **Decisión**: Utilizar variables CSS con nombres semánticos (ej. `--bg-primary`, `--text-secondary`) en lugar de valores directos o nombres de colores físicos (ej. `--dark-gray`).
- **Razón**: Permite una mayor flexibilidad para cambios de tema globales y facilita el mantenimiento por parte de diseñadores y desarrolladores.
- **Alternativa**: Mantener el sistema básico de `dark/light` mediante clases. Se descartó por ser poco escalable y difícil de mantener en una UI compleja.

### Formato de Activos Visuales (SVG/PNG)
- **Decisión**: Utilizar SVG como formato fuente para iconos por su escalabilidad y facilidad de manipulación mediante CSS, manteniendo PNG solo para compatibilidad de sistema (favicon, iconos de build).
- **Razón**: Asegura que la UI se vea nítida en pantallas de alta densidad (Retina/4K).

### Skill Local para el Agente
- **Decisión**: Mantener la skill `interface-design` dentro del directorio `.agent/skills/` del repositorio.
- **Razón**: Permite que las directrices de diseño viajen con el código y que el agente Gemini CLI pueda auto-activar la lógica de diseño específica del proyecto.

## Risks / Trade-offs

- **[Riesgo] Componentes con CSS Hardcoded** → **[Mitigación]** Realizar una auditoría de estilos y reemplazar valores directos por tokens de manera incremental.
- **[Trade-off] Mayor abstracción** → La curva de aprendizaje inicial para nuevos colaboradores aumenta ligeramente al tener que entender la jerarquía de tokens.
