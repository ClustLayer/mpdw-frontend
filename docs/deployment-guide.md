# Despliegue del frontend en Vercel

1. Importe este directorio como proyecto Vercel.
2. Framework: Vite. Comando de instalacion: `pnpm install --frozen-lockfile`. Comando de build: `pnpm run build`. Directorio de salida: `dist`.
3. Variable de entorno: `VITE_API_URL` con la URL HTTPS del backend en Render. No agregue llaves de correo ni de base de datos aqui.
4. En el backend, `CORS_ALLOWED_ORIGINS` y `FRONTEND_URL` deben usar el dominio que entregue Vercel.
5. `vercel.json` reescribe las rutas del enrutador hacia `index.html`.

Compruebe en el navegador el inicio de sesion, el cierre y que no exista una ruta publica de registro.
