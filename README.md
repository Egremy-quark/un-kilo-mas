# Un Kilo Más

Sitio estático de las calculadoras y del coaching de Yohan. El nombre de trabajo y todo lo pendiente viven en `src/config/sitio.ts`.

```bash
npm install
npx playwright install chromium
npm test
npm run dev
npm run build
npm run capturas
```

`npm run dev` abre el sitio. `npm test` corre las fórmulas. `npm run capturas` construye el sitio y guarda pantallas en `capturas/`.

El envío de correos escribe en la consola. MailerLite está de ejemplo en `src/lib/correo.mailerlite.ts` y lee `MAILERLITE_API_KEY` (ver `.env.example`). Esa clave no va al navegador.
