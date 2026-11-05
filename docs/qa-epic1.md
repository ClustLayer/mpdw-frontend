# QA — Epica 1

Ejecute el backend con migraciones aplicadas y el frontend con `pnpm dev`.

## Iniciar sesion
- Correo vacio o contraseña vacia: el boton queda inhabilitado.
- Correo sin formato: "El correo electrónico ingresado no tiene un formato válido."
- Credencial incorrecta, usuario inexistente o inactivo: "Credenciales no válidas, por favor intente de nuevo."
- Quinto fallo: "Acceso temporalmente bloqueado. Intente más tarde o contacte al administrador." Un intento durante el bloqueo muestra el mismo texto y no revela si la contraseña era correcta.
- Exito: toast "Bienvenido(a), {nombre}." y ruta del rol.
- `debe_cambiar_password`: no se puede abrir otro modulo hasta guardar la contraseña. Cancelar no aparece.
- Administrador con 2FA: pantalla de codigo antes del panel.

## Cerrar sesion
- El boton esta en el menu de todas las pantallas autenticadas.
- Exito: "Sesión cerrada correctamente." y regreso a iniciar sesion.
- Atras no vuelve a mostrar el panel.
- Si el servidor no revoca: "No fue posible cerrar la sesión en el servidor. Intente nuevamente." y el estado local queda limpio.

## Recuperar contraseña
- Boton deshabilitado con el correo vacio.
- La respuesta es siempre "Si el correo está registrado, recibirá un enlace para restablecer su contraseña."
- El enlace abre `/nueva-contrasena` y no pone el token en la consulta de la URL.
- Contraseñas distintas: "Las contraseñas no coinciden."
- Politica incumplida: "La contraseña no cumple los requisitos mínimos de seguridad."
- Enlace vencido o repetido: "El enlace de recuperación no es válido o ha expirado. Solicite uno nuevo."
- Exito: "Su contraseña ha sido restablecida. Ya puede iniciar sesión."

## Continuidad
- Tras el tiempo de inactividad menos cinco minutos aparece el dialogo con cuenta regresiva.
- Continuar sesion: "Su sesión continúa activa."
- Dejar vencer el dialogo: "Su sesión expiró por inactividad. Inicie sesión nuevamente."

## Dos pasos
- Codigo vacio: boton Verificar inhabilitado.
- Codigo incorrecto: "El código ingresado no es válido."
- Reenviar invalida el anterior.
- Exito: "Verificación completada."

## Accesibilidad
- Cada pantalla tiene un `h1`.
- Los errores usan `role="alert"` y los exitos un toast con `role="status"`.
- El dialogo de sesion usa `role="dialog"` y `aria-modal`.
- La contraseña tiene un boton con nombre accesible para mostrarla u ocultarla.
- No hay `alert()` del navegador.
