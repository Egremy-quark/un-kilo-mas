import type { APIRoute } from 'astro';
import { supabaseServidor } from '../../lib/supabase';

export const prerender = false;

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ORIGENES = new Set(['rutina-01', '1rm', 'proteina', 'calorias']);

interface Cuerpo {
  correo?: unknown;
  origen?: unknown;
  aviso?: unknown;
  empresa?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  utm_content?: unknown;
}

function texto(valor: unknown, maximo = 200): string | null {
  if (typeof valor !== 'string') return null;
  const limpio = valor.trim();
  if (!limpio) return null;
  return limpio.slice(0, maximo);
}

function json(cuerpo: { ok: boolean; mensaje: string }, estado = 200): Response {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let cuerpo: Cuerpo;
  try {
    cuerpo = (await request.json()) as Cuerpo;
  } catch {
    return json({ ok: false, mensaje: 'No se pudo leer el formulario. Intenta de nuevo.' }, 400);
  }

  if (texto(cuerpo.empresa)) {
    return json({ ok: true, mensaje: 'Listo, aquí tienes tu Rutina 01.' });
  }

  const correo = texto(cuerpo.correo, 320)?.toLowerCase();
  if (!correo || !CORREO_OK.test(correo)) {
    return json({ ok: false, mensaje: 'Escribe un correo válido, por ejemplo ana@correo.com.' }, 400);
  }

  if (cuerpo.aviso !== true) {
    return json({ ok: false, mensaje: 'Para enviarlo, acepta el aviso de privacidad.' }, 400);
  }

  const origenCrudo = texto(cuerpo.origen, 40) ?? 'rutina-01';
  const origen = ORIGENES.has(origenCrudo) ? origenCrudo : 'rutina-01';

  try {
    const supabase = supabaseServidor();
    const { error } = await supabase.from('leads').insert({
      correo,
      origen,
      utm_source: texto(cuerpo.utm_source, 80),
      utm_medium: texto(cuerpo.utm_medium, 80),
      utm_campaign: texto(cuerpo.utm_campaign, 80),
      utm_content: texto(cuerpo.utm_content, 80),
      aviso_aceptado: true,
    });
    if (error) {
      console.error('[suscribir]', error.message);
      return json({ ok: false, mensaje: 'No se pudo guardar tu correo. Intenta de nuevo.' }, 500);
    }
  } catch (error) {
    console.error('[suscribir]', error);
    return json({ ok: false, mensaje: 'No se pudo guardar tu correo. Intenta de nuevo.' }, 500);
  }

  return json({ ok: true, mensaje: 'Listo, aquí tienes tu Rutina 01.' });
};
