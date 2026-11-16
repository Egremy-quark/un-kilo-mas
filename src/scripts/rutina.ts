import { crearCuentaPrueba, MENSAJE_AVISO, MENSAJE_CORREO } from '../lib/cuenta';
import { sitio } from '../config/sitio';
import { medir } from '../lib/medicion';

export function iniciarRutina(): void {
  const form = document.getElementById('form-correo');
  const estadoNodo = document.getElementById('correo-estado');
  if (!(form instanceof HTMLFormElement) || !(estadoNodo instanceof HTMLParagraphElement)) return;
  const estado = estadoNodo;
  if (form.dataset.activo !== 'true') return;

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const correo = document.querySelector<HTMLInputElement>('#correo');
    const aviso = document.querySelector<HTMLInputElement>('#aviso-privacidad');
    const trampa = document.querySelector<HTMLInputElement>('[name="empresa"]');
    if (!correo || !aviso) return;

    estado.classList.remove('estado-error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value.trim())) {
      estado.classList.add('estado-error');
      estado.textContent = MENSAJE_CORREO;
      correo.focus();
      return;
    }
    if (!aviso.checked) {
      estado.classList.add('estado-error');
      estado.textContent = MENSAJE_AVISO;
      aviso.focus();
      return;
    }

    const captchaToken = sitio.captcha.activo
      ? document.querySelector<HTMLInputElement>('[name="captchaToken"]')?.value
      : undefined;

    void crearCuentaPrueba({
      correo: correo.value.trim(),
      aviso: true,
      trampa: trampa?.value ?? '',
      captchaToken,
    }).then((respuesta) => {
      estado.classList.toggle('estado-error', !respuesta.ok);
      estado.textContent = respuesta.mensaje;
      if (respuesta.ok) medir('correo_enviado', { calculadora: 'rutina' });
    });
  });
}
