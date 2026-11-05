# Configuracion

- `VITE_API_URL`: origen del backend. No pongas secretos en variables `VITE_`, porque el navegador las recibe.
- El access token vive en memoria. El refresh token queda en la cookie HttpOnly que define el backend.
- Los avisos usan el componente de toast. No se usa `alert()`.
