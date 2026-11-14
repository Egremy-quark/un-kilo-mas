import type { DatosSuscripcion } from './correo';

/**
 * Ejemplo para cuando el proveedor sea MailerLite.
 * Llamar solo desde un servidor. No importar este archivo desde el navegador:
 * la clave no lleva prefijo PUBLIC_ y no debe terminar en el sitio estático.
 *
 * En MailerLite hay que crear antes los campos calculadora, resultado,
 * utm_source, utm_medium, utm_campaign y utm_content.
 */
export async function enviarConMailerLite(datos: DatosSuscripcion): Promise<void> {
  const clave = import.meta.env.MAILERLITE_API_KEY;
  if (!clave) {
    throw new Error('Falta MAILERLITE_API_KEY');
  }

  const respuesta = await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${clave}`,
    },
    body: JSON.stringify({
      email: datos.correo,
      fields: {
        calculadora: datos.calculadora,
        resultado: datos.resultado,
        utm_source: datos.origen.utm_source ?? '',
        utm_medium: datos.origen.utm_medium ?? '',
        utm_campaign: datos.origen.utm_campaign ?? '',
        utm_content: datos.origen.utm_content ?? '',
      },
    }),
  });

  if (!respuesta.ok) {
    throw new Error('MailerLite no aceptó el correo');
  }
}
