# Un Kilo Más

Sitio público estático: marketing, calculadoras y el formulario que crea la cuenta de prueba en la plataforma. El nombre de trabajo y lo pendiente viven en `src/config/sitio.ts`. La app con login vive en otro repositorio, en `sitio.urlPlataforma`.

```bash
npm install
npx playwright install chromium
npm test
npm run dev
npm run build
npm run capturas
```

El formulario solo envía si `correo.activo` es `true`, el aviso de privacidad no tiene `[POR DEFINIR]` y `urlPlataforma` es una URL `https://`. Entonces el navegador llama a `signInWithOtp` con `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`. No hay servidor ni clave de servicio en este proyecto.

`captcha.activo` deja listo `captchaToken` para Cloudflare Turnstile. Sigue en `false`.
