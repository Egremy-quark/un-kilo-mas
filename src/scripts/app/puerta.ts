import { tieneAcceso } from '../../lib/app/acceso';
import { supabaseNavegador, supabaseNavegadorListo } from '../../lib/supabase-cliente';
import type { Perfil, TipoAcceso } from '../../lib/app/tipos';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface SesionApp {
  supabase: SupabaseClient;
  usuarioId: string;
  perfil: Perfil;
}

export function pintar(raiz: HTMLElement, html: string): void {
  raiz.innerHTML = html;
}

export async function abrirSesion(raiz: HTMLElement): Promise<SesionApp | null> {
  if (!supabaseNavegadorListo()) {
    pintar(
      raiz,
      `<p class="app-aviso">Falta configurar PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY. La app no puede entrar a la base.</p>`,
    );
    return null;
  }
  const supabase = supabaseNavegador();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    location.replace('/app/entrar');
    return null;
  }
  const { data } = await supabase.from('perfiles').select('id, correo, tipo_acceso').eq('id', session.user.id).single();
  const perfil = data as Perfil | null;
  if (!perfil || !tieneAcceso(perfil.tipo_acceso as TipoAcceso)) {
    pintar(
      raiz,
      `<p class="app-aviso">Tu cuenta existe, pero el acceso a la app aún no está activo. Un socio tiene que actualizar <code>perfiles.tipo_acceso</code>. No es un programa personalizado: el acceso es el mismo para cualquiera.</p>
       <p><a href="/app/entrar?salir=1">Salir</a></p>`,
    );
    return null;
  }
  return { supabase, usuarioId: session.user.id, perfil };
}
