# Implementation report

## Epica 1
**Status:** COMPLETED
**Date:** 2026-11-04

### Analysis
- Modo: MOCKUP_PRODUCTIONIZATION. La demo queda como referencia visual y este portal es el frontend de produccion.
- Alcance de esta epica: autenticacion. El resto de modulos del panel existe como entrada inerte.

### Evidencia
- `pnpm test`: 3 pruebas de validacion, mensajes, politica y temporizador, en verde.
- `pnpm run build`: compilacion de TypeScript y build de Vite correctos.

### Decisiones
- El access token no se escribe en `localStorage`. Se conserva en memoria y el refresh viaja en la cookie del backend.
- El token de recuperacion se lee del fragmento de la URL, no de la consulta.
- Los avisos usan el toast del portal. No hay `alert()`.
