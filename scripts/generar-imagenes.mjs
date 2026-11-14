import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fuente = readFileSync(resolve(raiz, 'src/config/sitio.ts'), 'utf8');
const nombre = fuente.match(/nombre:\s*'([^']+)'/)?.[1] ?? 'Un Kilo Más';

function escapar(texto) {
  return texto
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

const palabras = nombre.toLocaleUpperCase('es-MX').split(/\s+/).filter(Boolean);
const clave = escapar(palabras.pop() ?? '');
const resto = escapar(palabras.join(' '));

const simbolo = `
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <rect width="100" height="100" rx="18" fill="#1C1E1A"/>
    <path fill="#7CB518" d="M17 45h34v10H17zM29 32h10v36H29z"/>
    <path fill="#FAF7F0" d="M69 28h14v48H69zM57 42 69 28v14z"/>
  </svg>`;

const circulo = `
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="50" fill="#7CB518"/>
    <path fill="#1C1E1A" d="M17 45h34v10H17zM29 32h10v36H29z"/>
    <path fill="#1C1E1A" d="M69 28h14v48H69zM57 42 69 28v14z"/>
  </svg>`;

const og = `<!doctype html>
<html lang="es-MX">
<head>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=Source+Sans+3:wght@600&display=swap">
  <style>
    html, body { margin: 0; width: 1200px; height: 630px; background: #FAF7F0; color: #1C1E1A; }
    .franja { height: 16px; background: #7CB518; }
    .contenido { padding: 42px 72px 0; }
    .logo { display: flex; align-items: center; gap: 18px; font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-size: 56px; line-height: 0.9; }
    .logo svg { width: 52px; height: 52px; }
    .clave { background: #7CB518; color: #1C1E1A; padding: 0 0.08em; }
    h1 { margin: 64px 0 0; font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-size: 112px; line-height: 0.92; text-transform: uppercase; }
    em { font-style: normal; background: #7CB518; padding: 0 0.08em; }
    p { margin: 28px 0 0; font-family: "Source Sans 3", sans-serif; font-weight: 600; font-size: 34px; }
  </style>
</head>
<body>
  <div class="franja"></div>
  <div class="contenido">
    <div class="logo">${simbolo}<span>${resto} <span class="clave">${clave}</span></span></div>
    <h1>Calcula <em>lo básico</em></h1>
    <p>Tu 1RM, tu proteína y tus calorías.</p>
  </div>
</body>
</html>`;

function icono(tamano) {
  return `<!doctype html>
  <html><head><style>html,body{margin:0;width:${tamano}px;height:${tamano}px;background:#7CB518}svg{display:block;width:${tamano}px;height:${tamano}px}</style></head>
  <body>${circulo}</body></html>`;
}

mkdirSync(resolve(raiz, 'public'), { recursive: true });

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await pagina.setContent(og, { waitUntil: 'networkidle' });
await pagina.evaluate(() => document.fonts.ready);
await pagina.screenshot({ path: resolve(raiz, 'public/og.png') });

for (const [tamano, archivo] of [
  [180, 'apple-touch-icon.png'],
  [32, 'favicon-32.png'],
]) {
  await pagina.setViewportSize({ width: tamano, height: tamano });
  await pagina.setContent(icono(tamano), { waitUntil: 'load' });
  await pagina.screenshot({ path: resolve(raiz, 'public', archivo) });
}

await navegador.close();
console.log('Imágenes de marca listas en public/.');
