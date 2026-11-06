# Changelog

Versionado del portal (major.sprint.epica): **1.1.5** = producto 1, sprint 1, épicas 13 y 18. Entregas previas: **1.1.1** Épica 1, **1.1.2** Épica 2, **1.1.3** Épica 3, **1.1.4** Épica 4.

## 2026-11-06 — v1.1.5 Cierre Sprint 1 (Épica 13 + 18)

- Módulo panel **Auditoría** (`panel-auditoria-page`): filtros, tabla, detalle con diff, mensajes CA y debounce 300 ms en búsqueda de usuario.
- Comportamientos transversales (HU 96–97): `ConfirmDestructiveDialog` con motivo opcional obligatorio, `ConflictDialog`, mensajes en `features/transversal/messages.ts`; integración en usuarios (409/403).
- `cuerpoError` en cliente API para mensajes de error estructurados.

## 2026-11-05 — Deuda tecnica Copilot (Epic 2)

- Listado de usuarios: cancelacion logica de peticiones obsoletas, clamp de pagina y errores de red.
- Modal de edicion: carga segura sin datos cruzados; contraseña temporal sin doble lectura del body.
- Kit: `useId` en modales, cierre de backdrop seguro y errores visibles en `useDo`.

## 2026-11-05 — Correccion Mi perfil (demo) y notificaciones

- Pantalla Mi perfil con layout de la demo (datos personales + cambio de contraseña en panel).
- Menu unificado como Mi perfil; avisos de funcionalidad en desarrollo via toast (sin `alert`).

## 2026-11-05 — Epica 2, administracion de usuarios y perfil

- Modulo panel Usuarios alineado con la demo: filtros, tabla, crear/editar y cambiar estado.
- Confirmaciones HU 98 para rol, estado y contraseña temporal; resultado con copiar al portapapeles.
- Mi perfil en panel cuenta con enlace a cambiar contraseña.

## 2026-11-04 — Epica 1, autenticacion y seguridad de sesion

- Pantalla de inicio de sesion, recuperacion, nueva contraseña, cambio de contraseña y verificacion en dos pasos.
- Cierre de sesion desde la barra y aviso de inactividad con renovacion.
- El resto de modulos del panel queda enrutado y muestra "Funcionalidad en desarrollo".
