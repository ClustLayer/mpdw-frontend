# User stories

Las seis historias de la epica 1 quedaron implementadas en este portal el 2026-11-04. El texto de negocio y los mensajes literales estan en `src/features/auth/logic.ts` y se corresponden con el backend.

**Status:** COMPLETED

- HU_MPDW_01_01 Iniciar sesion
- HU_MPDW_01_02 Cerrar sesion
- HU_MPDW_01_03 Recuperar contraseña
- HU_MPDW_01_04 Cambiar contraseña
- HU_MPDW_01_05 Continuidad de sesion
- HU_MPDW_01_06 Verificacion en dos pasos

La demo `MundoPinturasDiana-Demo` no forma parte de este repositorio y no se modifica.

## Epica 2 (2026-11-05) — **Status:** COMPLETED

- HU_MPDW_01_07 Crear usuario — `src/pages/panel-usuarios-page.tsx`, `src/features/usuarios/`
- HU_MPDW_01_08 Listado de usuarios — mismos archivos
- HU_MPDW_01_09 Editar usuario — modal de edicion y confirmacion de cambio de rol
- HU_MPDW_01_10 Cambiar estado — acciones activar, desactivar, bloquear
- HU_MPDW_01_11 Contraseña temporal — resultado de un solo uso con copiar
- HU_MPDW_01_12 Mi perfil — `src/pages/panel-cuenta-page.tsx`

## Epica 3 (2026-11-05) — **Status:** COMPLETED

- HU_MPDW_01_13–14 Roles — pestaña Roles en `src/pages/panel-permisos-page.tsx`
- HU_MPDW_01_15–16 Catálogo de permisos — misma página, pestaña Catálogo
- HU_MPDW_01_17 Matriz — pestaña Matriz (rol / usuario)
- HU_MPDW_01_18 Menú y rutas — `useAccesosPanel`, `PanelAccesoDenegadoPage`, filtro en `shell.tsx`
- Deuda UI Ep.2 — filtros de usuarios en una fila y cabecera alineada con la demo en `panel-usuarios-page.tsx`
