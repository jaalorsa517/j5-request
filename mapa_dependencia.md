┌──────────────────────────────────────────┐
│ FASE 1: Core & Sistema de Archivos       │
│ (RF-01, RNF-01)                          │◀── La base de todo.
│ - Estructura carpetas = Colecciones      │    Si esto cambia, todo se rompe.
│ - Archivos .json = Peticiones            │
└────────────────────┬─────────────────────┘
                     │
          ┌────────▼─────────┐
          │                  │
┌─────────▼────────┐    ┌────▼─────────────┐
│ FASE 2: Motor UI │    │ FASE 3: Git Ops  │
│ (RF-02, RF-03)   │    │ (RNF-01, RNF-02) │
│ - Editor (Monaco)│    │ - Diff visual    │
│ - Request/Res    │    │ - Commit/Push    │
└─────────┬────────┘    └──────────────────┘
          │
┌─────────▼────────┐
│ FASE 4: Ejecutor │
│ (RNF-04, RF-08)  │
│ - Node Sandbox   │
│ - Scripting      │
└──────────────────┘