## Context

La aplicación carece de un canal directo para el reporte de errores. Dado que el proyecto se aloja en GitHub, lo más eficiente es aprovechar "GitHub Issues". Ya contamos con un mecanismo en el proceso principal para abrir URLs externas de forma segura.

## Goals / Non-Goals

**Goals:**
- Facilitar el reporte de errores y sugerencias.
- Proporcionar una URL que pre-pueble información útil (como la versión de la app).
- Mantener una interfaz limpia y coherente con el estilo del proyecto.

**Non-Goals:**
- Implementar un sistema de tickets interno en la app.
- Recolectar logs automáticos sensibles sin consentimiento explícito.

## Decisions

1. **Uso de GitHub Query Parameters**: Se utilizará una URL con parámetros `title` y `body` para pre-poblar el issue.
   - *Razón*: Evita que el usuario tenga que escribir manualmente la versión que está usando.
2. **Ubicación en AboutModal**: Se añadirá un botón secundario debajo del botón de donación o junto a la información de la versión.
   - *Razón*: Es el lugar estándar donde los usuarios buscan soporte o información del autor.

## Risks / Trade-offs

- **[Riesgo] Dependencia de conectividad** → El botón no funcionará sin internet (mitigado: es inherente al reporte en GitHub).
- **[Trade-off] Privacidad** → Al pre-poblar el cuerpo del issue con la versión, no se expone información personal, cumpliendo con la política de privacidad.
