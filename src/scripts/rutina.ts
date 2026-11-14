import { enviarSuscripcion } from '../lib/correo';
import { medir } from '../lib/medicion';
import { leerOrigen } from '../lib/origen';

export function iniciarRutina(): void {
  const form = document.getElementById('form-correo');
  const estadoNodo = document.getElementById('correo-estado');
  if (!(form instanceof HTMLFormElement) || !(estadoNodo instanceof HTMLParagraphElement)) return;
  const estado = estadoNodo;

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const correo = document.querySelector<HTMLInputElement>('#correo');
    const aviso = document.querySelector<HTMLInputElement>('#aviso-privacidad');
    if (!correo || !aviso) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value.trim())) {
      estado.textContent = 'Escribe un correo válido, por ejemplo ana@correo.com.';
      correo.focus();
      return;
    }
    if (!aviso.checked) {
      estado.textContent = 'Para enviarlo, acepta el aviso de privacidad.';
      aviso.focus();
      return;
    }

    void enviarSuscripcion({
      correo: correo.value.trim(),
      origen: leerOrigen(),
    }).then((respuesta) => {
      estado.textContent = respuesta.mensaje;
      if (respuesta.ok) {
        medir('correo_enviado', { calculadora: 'rutina' });
        const entrega = document.getElementById('entrega-rutina');
        if (entrega) entrega.hidden = false;
      }
    });
  });
}
