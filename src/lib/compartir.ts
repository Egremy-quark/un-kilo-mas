import { sitio } from '../config/sitio';
import { partesNombre, TRAZO_MAS, TRAZO_UNO } from './marca';

export interface DatosTarjeta {
  calculadora: '1rm' | 'proteina' | 'calorias';
  titulo: string;
  cifra: string;
  unidad: string;
  explicacion: string;
}

const ANCHO = 1080;
const ALTO = 1350;

function partir(ctx: CanvasRenderingContext2D, texto: string, maximo: number): string[] {
  const palabras = texto.split(' ');
  const lineas: string[] = [];
  let actual = '';
  for (const palabra of palabras) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (ctx.measureText(prueba).width > maximo && actual) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = prueba;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

function dibujarLogo(ctx: CanvasRenderingContext2D, x: number, y: number, alto: number): void {
  ctx.save();
  ctx.translate(x, y);
  const escala = alto / 100;
  ctx.scale(escala, escala);
  ctx.beginPath();
  ctx.roundRect(0, 0, 100, 100, 18);
  ctx.fillStyle = '#1C1E1A';
  ctx.fill();
  ctx.fillStyle = '#7CB518';
  ctx.fill(new Path2D(TRAZO_MAS));
  ctx.fillStyle = '#FAF7F0';
  ctx.fill(new Path2D(TRAZO_UNO));
  ctx.restore();

  const { resto, clave } = partesNombre(sitio.nombre);
  const tamano = Math.round(alto * 0.62);
  ctx.font = `800 ${tamano}px "Barlow Condensed"`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const textoX = x + alto + 18;
  const textoY = y + alto / 2;
  ctx.fillStyle = '#1C1E1A';
  const prefijo = resto ? `${resto} ` : '';
  ctx.fillText(prefijo, textoX, textoY);
  const anchoPrefijo = ctx.measureText(prefijo).width;
  const anchoClave = ctx.measureText(clave).width;
  const padX = tamano * 0.08;
  const claveX = textoX + anchoPrefijo;
  ctx.fillStyle = '#7CB518';
  ctx.fillRect(claveX - padX, y + alto * 0.14, anchoClave + padX * 2, alto * 0.72);
  ctx.fillStyle = '#1C1E1A';
  ctx.fillText(clave, claveX, textoY);
}

function dibujar(ctx: CanvasRenderingContext2D, datos: DatosTarjeta): void {
  ctx.fillStyle = '#FAF7F0';
  ctx.fillRect(0, 0, ANCHO, ALTO);

  ctx.fillStyle = '#7CB518';
  ctx.fillRect(0, 90, ANCHO, 20);

  ctx.fillStyle = '#1C1E1A';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '700 44px "Source Sans 3"';
  const titulo = partir(ctx, datos.titulo, 920);
  titulo.forEach((linea, indice) => {
    ctx.fillText(linea, ANCHO / 2, 160 + indice * 56);
  });

  let tamano = 380;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.font = `800 ${tamano}px "Barlow Condensed"`;
  while (ctx.measureText(datos.cifra).width > 760 && tamano > 200) {
    tamano -= 10;
    ctx.font = `800 ${tamano}px "Barlow Condensed"`;
  }
  const anchoCifra = ctx.measureText(datos.cifra).width;
  ctx.font = `700 ${tamano * 0.4}px "Source Sans 3"`;
  const anchoUnidad = ctx.measureText(datos.unidad).width;
  const separacion = 16;
  const total = anchoCifra + separacion + anchoUnidad;
  const inicio = (ANCHO - total) / 2;
  const baseline = 640;
  ctx.fillStyle = '#1C1E1A';
  ctx.font = `800 ${tamano}px "Barlow Condensed"`;
  ctx.fillText(datos.cifra, inicio, baseline);
  ctx.font = `700 ${tamano * 0.4}px "Source Sans 3"`;
  ctx.fillText(datos.unidad, inicio + anchoCifra + separacion, baseline);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#5E615A';
  ctx.font = '600 36px "Source Sans 3"';
  ctx.fillText('estimado', ANCHO / 2, 690);

  ctx.fillStyle = '#1C1E1A';
  ctx.font = '400 34px "Source Sans 3"';
  const explicacion = partir(ctx, datos.explicacion, 900);
  explicacion.slice(0, 3).forEach((linea, indice) => {
    ctx.fillText(linea, ANCHO / 2, 790 + indice * 46);
  });

  ctx.fillStyle = '#7CB518';
  ctx.fillRect(70, 1060, ANCHO - 140, 110);
  ctx.fillStyle = '#1C1E1A';
  ctx.font = '700 40px "Source Sans 3"';
  ctx.textBaseline = 'middle';
  const llamado = partir(ctx, `Calcula el tuyo en ${sitio.dominio}`, 900);
  const altoLinea = 48;
  const bloqueCentro = 1115;
  const origenY = bloqueCentro - ((llamado.length - 1) * altoLinea) / 2;
  llamado.forEach((linea, indice) => {
    ctx.fillText(linea, ANCHO / 2, origenY + indice * altoLinea);
  });

  ctx.textBaseline = 'alphabetic';
  dibujarLogo(ctx, 70, 1210, 88);
}

function nombreArchivo(calculadora: DatosTarjeta['calculadora']): string {
  const slug = sitio.nombre
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${slug}-${calculadora}.png`;
}

function descargar(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

export async function compartirResultado(datos: DatosTarjeta): Promise<'compartido' | 'descargado'> {
  await document.fonts.load('800 380px "Barlow Condensed"');
  await document.fonts.load('700 152px "Source Sans 3"');
  await document.fonts.load('700 44px "Source Sans 3"');
  await document.fonts.load('600 36px "Source Sans 3"');
  await document.fonts.load('400 34px "Source Sans 3"');
  await document.fonts.ready;

  const lienzo = document.createElement('canvas');
  lienzo.width = ANCHO;
  lienzo.height = ALTO;
  const ctx = lienzo.getContext('2d');
  if (!ctx) throw new Error('No se pudo crear la imagen');
  dibujar(ctx, datos);

  const blob = await new Promise<Blob | null>((resolver) => {
    lienzo.toBlob(resolver, 'image/png');
  });
  if (!blob) throw new Error('No se pudo exportar la imagen');

  const archivo = new File([blob], nombreArchivo(datos.calculadora), { type: 'image/png' });
  const puedeCompartir =
    typeof navigator.canShare === 'function' && navigator.canShare({ files: [archivo] });

  if (puedeCompartir) {
    await navigator.share({ files: [archivo], title: datos.titulo });
    return 'compartido';
  }

  descargar(blob, archivo.name);
  return 'descargado';
}
