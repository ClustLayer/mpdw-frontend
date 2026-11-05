# Integration report

## Epica 1
**Date:** 2026-11-04
**Status:** PARTIALLY_VERIFIED

El cliente llama los caminos publicados por el backend (`/api/v1/auth/login`, `refresh`, `logout`, `recuperar`, `restablecer`, `cambiar-contrasena`, `verificar-2fa`, `reenviar-2fa`, `politica-sesion`) y muestra el campo `mensaje` sin reformularlo.

La compilacion y las pruebas de reglas de pantalla pasaron. El recorrido manual con la API y la base de Supabase no se ejecuto en esta sesion: queda descrito en `docs/qa-epic1.md`.
