# Un Kilo Más

Sitio estático de las calculadoras y del coaching de Yohan, más la app de trackeo. El nombre de trabajo y todo lo pendiente viven en `src/config/sitio.ts`.

```bash
npm install
npx playwright install chromium
npm test
npm run dev
npm run build
npm run capturas
```

`npm run dev` abre el sitio. `npm test` corre las fórmulas y las pruebas de la app. `npm run capturas` construye el sitio y guarda pantallas en `capturas/`.

El envío de correos escribe en la consola. MailerLite está de ejemplo en `src/lib/correo.mailerlite.ts` y lee `MAILERLITE_API_KEY` (ver `.env.example`). Esa clave no va al navegador.

## App de trackeo

Rutas: `/app`, `/app/entrar`, `/app/sesion`, `/app/historial`, `/app/avance`.

No está en el menú del sitio. Sigue cerrada al público (`sitio.app.abiertaAlPublico` y `configuracion.app_abierta_al_publico`). Los bloques de prueba no son programas de Yohan.

Variables de entorno, además de las del servidor:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

En Supabase: corre `supabase/migrations/20261114180000_app_trackeo.sql`, activa Auth por correo y añade las URLs de redirección (`http://localhost:4321/app/entrar` y `https://un-kilo-mas.vercel.app/app/entrar`).

### Cómo cargar un bloque de Yohan

1. Copia `src/datos/bloques/plantilla.json.ejemplo` a un `.json` nuevo.
2. Llena clave, nombre, descripción, sesiones, ejercicios, series y repeticiones. El contenido real es `[CONTENIDO POR YOHAN]`.
3. `es_prueba: false` solo cuando el contenido lo entregó Yohan. `publicado: true` cuando deba verse.
4. `npm run bloques` (usa `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`).

No hay que tocar código. Las Rutinas 01 y 02 entran como dos JSON más.

### Cómo dar acceso sin cobrar

```sql
update public.perfiles
set tipo_acceso = 'paquete'
where correo = 'correo@de.la.persona';
```

Valores: `ninguno` (sin acceso), `gratuito`, `coaching`, `paquete`. La app es la misma para cualquiera que no sea `ninguno`. El tipo solo abre la puerta.

Durante pruebas, `acceso_inicial` vale `paquete`. Antes de abrir al público:

```sql
update public.configuracion set valor = 'ninguno' where clave = 'acceso_inicial';
update public.configuracion set valor = 'true' where clave = 'app_abierta_al_publico';
```

Y en `src/config/sitio.ts`, `app.abiertaAlPublico: true`.

### Qué falta para cobrar

Nada de pagos en esta base. Cuando exista proveedor (`[POR DEFINIR]` precio, nombre comercial y fecha), el webhook solo hace:

```sql
update public.perfiles set tipo_acceso = 'paquete' where id = '<usuario>';
```

Punto de conexión: `src/lib/app/acceso.ts` (`CONEXION_COBRO`).

### Decisiones pendientes

- Yohan: bloques reales, textos técnicos, progresiones, y si las Rutinas 01 y 02 se cargan como bloques.
- Los dos socios: precio del paquete, nombre comercial, fecha de apertura, proveedor de pagos, dominio, cupo y precio del coaching.
- Tecnología: aplicar la migración en el proyecto de Supabase, poner las claves `PUBLIC_` en Vercel y confirmar el correo de Auth.
