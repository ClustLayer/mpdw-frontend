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

## Epica 2
**Status:** COMPLETED
**Date:** 2026-11-05

### Alcance
- Panel administrador: modulo Usuarios (HU 07–11) y Mi cuenta (HU 12).
- UI basada en la demo `MundoPinturasDiana-Demo`; demas modulos del panel sin cambios funcionales.

### Evidencia
- `npm exec pnpm@10.15.0 run calidad`: lint 0 errores, vitest, build y playwright en verde.
- `src/features/usuarios/logic.test.ts`: validacion de campos obligatorios.

## Epica 3
**Status:** COMPLETED  
**Date:** 2026-11-05

### Alcance
- Modulo Permisos (roles, catalogo, matriz) para administrador.
- Menu filtrado por `GET /api/v1/auth/accesos-panel`; pantalla acceso denegado.
- Correccion UI usuarios: filtros en una fila y cabecera tipo demo.

### Evidencia
- `npx pnpm run calidad`: lint, tsc, vitest, build, e2e en verde.
