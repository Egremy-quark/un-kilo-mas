import { supabaseNavegador, supabaseNavegadorListo } from '../../lib/supabase-cliente';
import { pintar } from './puerta';

function raiz(): HTMLElement {
  return document.getElementById('app-raiz') as HTMLElement;
}

function formulario(titulo: string, extra: string, boton: string, modo: string): string {
  return `
    <h1>${titulo}</h1>
    <p>La app registra bloques generales y tus cargas. No es un programa a tu medida ni sustituye al coaching.</p>
    <form class="app-form" data-modo="${modo}">
      <label>Correo
        <input type="email" name="correo" autocomplete="email" required />
      </label>
      ${extra}
      <p class="app-error" hidden></p>
      <button class="boton app-boton-grande" type="submit">${boton}</button>
    </form>
  `;
}

function pintarEntrar(): void {
  pintar(
    raiz(),
    `${formulario('Entra a tu registro', `<label>Contraseña
        <input type="password" name="clave" autocomplete="current-password" required minlength="8" />
      </label>`, 'Entrar', 'entrar')}
     <p><a href="/app/entrar?modo=registro">Crear cuenta de prueba</a> · <a href="/app/entrar?modo=recuperar">Olvidé la contraseña</a></p>`,
  );
}

function pintarRegistro(): void {
  pintar(
    raiz(),
    `${formulario('Crea tu cuenta', `<label>Contraseña
        <input type="password" name="clave" autocomplete="new-password" required minlength="8" />
      </label>`, 'Crear cuenta', 'registro')}
     <p>Esto no abre un coaching ni una rutina personalizada. Solo te deja registrar bloques generales cuando tengas acceso.</p>
     <p><a href="/app/entrar">Ya tengo cuenta</a></p>`,
  );
}

function pintarRecuperar(): void {
  pintar(
    raiz(),
    `${formulario('Recupera tu contraseña', '', 'Enviar enlace', 'recuperar')}
     <p>Te llega un correo de Supabase con el enlace. <a href="/app/entrar">Volver a entrar</a></p>`,
  );
}

function pintarNuevaClave(): void {
  pintar(
    raiz(),
    `${formulario('Elige una contraseña nueva', `<label>Contraseña nueva
        <input type="password" name="clave" autocomplete="new-password" required minlength="8" />
      </label>`, 'Guardar contraseña', 'nueva')}
     <p><a href="/app/entrar">Cancelar</a></p>`,
  );
}

function errorDe(nodo: HTMLElement, texto: string): void {
  const aviso = nodo.querySelector('.app-error') as HTMLElement | null;
  if (!aviso) return;
  aviso.hidden = !texto;
  aviso.textContent = texto;
}

export async function iniciarEntrar(): Promise<void> {
  const caja = raiz();
  if (!supabaseNavegadorListo()) {
    pintar(caja, `<p class="app-aviso">Faltan PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY.</p>`);
    return;
  }
  const supabase = supabaseNavegador();
  const params = new URLSearchParams(location.search);

  if (params.get('salir') === '1') {
    await supabase.auth.signOut();
    location.replace('/app/entrar');
    return;
  }

  supabase.auth.onAuthStateChange((evento) => {
    if (evento === 'PASSWORD_RECOVERY') pintarNuevaClave();
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session && params.get('modo') !== 'recuperar') {
    location.replace('/app');
    return;
  }

  const modo = params.get('modo');
  if (modo === 'registro') pintarRegistro();
  else if (modo === 'recuperar') pintarRecuperar();
  else pintarEntrar();

  caja.addEventListener('submit', async (evento) => {
    const form = evento.target as HTMLFormElement;
    if (!(form instanceof HTMLFormElement)) return;
    evento.preventDefault();
    errorDe(form, '');
    const datos = new FormData(form);
    const correo = String(datos.get('correo') ?? '').trim();
    const clave = String(datos.get('clave') ?? '');
    const accion = form.dataset.modo;
    const destino = `${location.origin}/app/entrar`;

    if (accion === 'entrar') {
      const { error } = await supabase.auth.signInWithPassword({ email: correo, password: clave });
      if (error) return errorDe(form, 'No se pudo entrar. Revisa correo y contraseña.');
      location.replace('/app');
      return;
    }
    if (accion === 'registro') {
      const { error } = await supabase.auth.signUp({
        email: correo,
        password: clave,
        options: { emailRedirectTo: destino },
      });
      if (error) return errorDe(form, 'No se pudo crear la cuenta. Prueba con otro correo.');
      pintar(
        caja,
        `<h1>Revisa tu correo</h1><p>Si Supabase pide confirmación, abre el enlace y vuelve a entrar. Si no, <a href="/app/entrar">entra ahora</a>.</p>`,
      );
      return;
    }
    if (accion === 'recuperar') {
      const { error } = await supabase.auth.resetPasswordForEmail(correo, { redirectTo: destino });
      if (error) return errorDe(form, 'No se pudo enviar el enlace.');
      pintar(caja, `<h1>Revisa tu correo</h1><p>Ahí está el enlace para cambiar la contraseña.</p>`);
      return;
    }
    if (accion === 'nueva') {
      const { error } = await supabase.auth.updateUser({ password: clave });
      if (error) return errorDe(form, 'No se pudo guardar la contraseña nueva.');
      location.replace('/app');
    }
  });
}
