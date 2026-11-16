import { sitio } from '../config/sitio';
import { leerOrigen } from './origen';
import { supabaseNavegador, supabaseNavegadorListo } from './supabase-cliente';

export const MENSAJE_EXITO =
  'Listo. Revisa tu correo y toca el enlace para entrar. Si no lo ves, busca en no deseados.';
export const MENSAJE_LIMITE =
  'Ya te mandamos un enlace hace poco. Revisa tu correo o inténtalo en unos minutos.';
export const MENSAJE_ERROR = 'No pudimos crear tu cuenta. Inténtalo de nuevo en un momento.';
export const MENSAJE_CORREO = 'Escribe un correo válido, por ejemplo ana@correo.com.';
export const MENSAJE_AVISO = 'Para enviarlo, acepta el aviso de privacidad.';

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RespuestaCuenta {
  ok: boolean;
  mensaje: string;
}

export function correoValido(correo: string): boolean {
  return CORREO_OK.test(correo.trim());
}

/**
 * Crea la cuenta de prueba en la plataforma con un enlace mágico.
 * No manda rol ni plan: el disparador de la plataforma asigna el perfil.
 */
export async function crearCuentaPrueba(opciones: {
  correo: string;
  aviso: boolean;
  trampa: string;
  captchaToken?: string;
}): Promise<RespuestaCuenta> {
  const correo = opciones.correo.trim().toLowerCase();
  if (!correoValido(correo)) {
    return { ok: false, mensaje: MENSAJE_CORREO };
  }
  if (!opciones.aviso) {
    return { ok: false, mensaje: MENSAJE_AVISO };
  }
  if (opciones.trampa.trim()) {
    return { ok: true, mensaje: MENSAJE_EXITO };
  }
  if (!supabaseNavegadorListo()) {
    return { ok: false, mensaje: MENSAJE_ERROR };
  }

  const utm = leerOrigen();
  const data: Record<string, string | boolean> = {
    acepta_aviso: true,
  };
  if (utm.utm_source) data.utm_source = utm.utm_source;
  if (utm.utm_medium) data.utm_medium = utm.utm_medium;
  if (utm.utm_campaign) data.utm_campaign = utm.utm_campaign;
  if (utm.utm_content) data.utm_content = utm.utm_content;

  const destino = `${sitio.urlPlataforma.replace(/\/$/, '')}/bienvenida`;
  const extra = sitio.captcha.activo && opciones.captchaToken
    ? { captchaToken: opciones.captchaToken }
    : {};

  const { error } = await supabaseNavegador().auth.signInWithOtp({
    email: correo,
    options: {
      emailRedirectTo: destino,
      data,
      ...extra,
    },
  });

  if (!error) return { ok: true, mensaje: MENSAJE_EXITO };
  if (error.status === 429) return { ok: false, mensaje: MENSAJE_LIMITE };
  return { ok: false, mensaje: MENSAJE_ERROR };
}

/** Si una calculadora pide correo, inserta el lead. Sin .select(): el anónimo no puede leer. */
export async function guardarLeadCalculadora(
  correo: string,
  nombre: '1rm' | 'proteina' | 'calorias',
): Promise<RespuestaCuenta> {
  const limpio = correo.trim().toLowerCase();
  if (!correoValido(limpio)) {
    return { ok: false, mensaje: MENSAJE_CORREO };
  }
  if (!supabaseNavegadorListo()) {
    return { ok: false, mensaje: MENSAJE_ERROR };
  }
  const utm = leerOrigen();
  const { error } = await supabaseNavegador().from('leads').insert({
    correo: limpio,
    origen: `calculadora-${nombre}`,
    utm_source: utm.utm_source ?? null,
    utm_medium: utm.utm_medium ?? null,
    utm_campaign: utm.utm_campaign ?? null,
    utm_content: utm.utm_content ?? null,
    aviso_aceptado: true,
  });
  if (error) return { ok: false, mensaje: MENSAJE_ERROR };
  return { ok: true, mensaje: MENSAJE_EXITO };
}
