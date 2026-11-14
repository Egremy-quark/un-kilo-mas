import { medir } from '../lib/medicion';

function valorDe(grupo: HTMLElement): string {
  const radio = grupo.querySelector<HTMLInputElement>('input[type="radio"]:checked');
  if (radio) return radio.value.trim();
  const texto = grupo.querySelector<HTMLInputElement | HTMLTextAreaElement>('input[type="text"], textarea');
  return texto?.value.trim() ?? '';
}

export function iniciarFiltro(): void {
  const form = document.querySelector<HTMLFormElement>('#filtro');
  const accion = document.getElementById('filtro-accion');
  const ayuda = document.getElementById('filtro-ayuda');
  if (!form || !accion || !ayuda) return;

  const grupos = [...form.querySelectorAll<HTMLElement>('[data-etiqueta]')];
  let avisado = false;

  const pintar = (): void => {
    const listo = grupos.every((grupo) => valorDe(grupo).length > 0);
    if (!listo) {
      accion.hidden = true;
      ayuda.hidden = false;
      return;
    }

    ayuda.hidden = true;
    accion.hidden = false;
    accion.replaceChildren();

    const numero = form.dataset.whatsapp ?? '';
    if (!/^\d{8,15}$/.test(numero)) {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'boton';
      boton.disabled = true;
      boton.textContent = 'Muy pronto';
      accion.append(boton);
    } else {
      const lineas = ['Hola Yohan, quiero saber del coaching.'];
      for (const grupo of grupos) {
        const etiqueta = (grupo.dataset.etiqueta ?? '').replace(/\?$/, '');
        lineas.push(`${etiqueta}: ${valorDe(grupo)}`);
      }
      const enlace = document.createElement('a');
      enlace.className = 'boton';
      enlace.target = '_blank';
      enlace.rel = 'noopener noreferrer';
      enlace.href = `https://wa.me/${numero}?text=${encodeURIComponent(lineas.join('\n'))}`;
      enlace.textContent = 'Escribir a Yohan por WhatsApp';
      enlace.addEventListener('click', () => {
        medir('whatsapp_abierto', {});
      });
      accion.append(enlace);
    }

    if (!avisado) {
      avisado = true;
      medir('filtro_completado', {});
    }
  };

  form.addEventListener('input', pintar);
  form.addEventListener('change', pintar);
}
