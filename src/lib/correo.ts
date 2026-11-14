import type { OrigenTrafico } from './origen';

export interface DatosSuscripcion {
  correo: string;
  calculadora?: string;
  resultado?: string;
  origen: OrigenTrafico;
}

export interface ResultadoEnvio {
  ok: boolean;
  mensaje: string;
}

/**
 * Adaptador de correos. Hoy escribe en la consola.
 * La Rutina 01 se abre en la misma página; no se manda un PDF ni un enlace de Drive.
 * MailerLite está de ejemplo en correo.mailerlite.ts y solo debe usarse desde un servidor.
 * La clave se lee de MAILERLITE_API_KEY. Nunca va en el código ni en el navegador.
 */
export async function enviarSuscripcion(datos: DatosSuscripcion): Promise<ResultadoEnvio> {
  console.info('[correo]', {
    correo: datos.correo,
    calculadora: datos.calculadora,
    resultado: datos.resultado,
    origen: datos.origen,
  });
  return {
    ok: true,
    mensaje: 'Listo. La Rutina 01, Base articular, quedó en esta página.',
  };
}
