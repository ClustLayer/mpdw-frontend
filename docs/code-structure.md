# Code structure

## Frontend

### Pages
- `/login` (HU_MPDW_01_01)
- `/recuperar` y `/nueva-contrasena` (HU_MPDW_01_03)
- `/cambiar-contrasena` (HU_MPDW_01_04)
- `/verificacion` (HU_MPDW_01_06)
- `/panel/administrador`, `/panel/gerente`, `/panel/empleado` con aviso de inactividad (HU_MPDW_01_05) y cierre de sesion (HU_MPDW_01_02)
- `/registro` redirige a `/login`. No hay alta publica.

### Modules
- `src/features/auth/logic.ts` — validaciones y mensajes literales
- `src/shared/api.ts` — cliente HTTP, una sola renovacion ante 401, cookie incluida
- `src/app/providers.tsx` — toasts accesibles
- `src/app/shell.tsx` — navegacion, cierre de sesion y dialogo de inactividad
- `src/shared` aviso "Funcionalidad en desarrollo" para modulos de otras historias
