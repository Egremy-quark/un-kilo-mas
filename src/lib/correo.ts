import type { IdCalculadora } from './calculos';
import { leerOrigen } from './origen';

export interface DatosSuscripcion {
  correo: string;
  calculadora?: IdCalculadora;
  resultado?: string;
  origen?: Record<string, string>;
}

export interface RespuestaSuscripcion {
  ok: boolean;
  mensaje: string;
}

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ERROR = 'No se pudo guardar tu correo. Intenta de nuevo.';

function origenDesde(datos: DatosSuscripcion): string {
  if (datos.calculadora) return datos.calculadora;
  return 'rutina-01';
}

export async function enviarSuscripcion(datos: DatosSuscripcion): Promise<RespuestaSuscripcion> {
  if (!CORREO_OK.test(datos.correo)) {
    return { ok: false, mensaje: 'Escribe un correo válido, por ejemplo ana@correo.com.' };
  }

  const utm = datos.origen ?? leerOrigen();
  const trampa =
    typeof document === 'undefined' ? null : document.querySelector<HTMLInputElement>('[name="empresa"]');

  try {
    const respuesta = await fetch('/api/suscribir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: datos.correo,
        origen: origenDesde(datos),
        aviso: true,
        empresa: trampa?.value ?? '',
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_content: utm.utm_content,
      }),
    });
    const cuerpo = (await respuesta.json()) as Partial<RespuestaSuscripcion>;
    if (typeof cuerpo.ok === 'boolean' && typeof cuerpo.mensaje === 'string') {
      return { ok: cuerpo.ok, mensaje: cuerpo.mensaje };
    }
    return { ok: false, mensaje: ERROR };
  } catch {
    return { ok: false, mensaje: ERROR };
  }
}
