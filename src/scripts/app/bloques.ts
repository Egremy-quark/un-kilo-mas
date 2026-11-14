import { sitio } from '../../config/sitio';
import { supabaseNavegador, supabaseNavegadorListo } from '../../lib/supabase-cliente';
import { escapar } from '../../lib/app/html';
import type { Bloque, ProgresoBloque, SesionBloque } from '../../lib/app/tipos';
import { abrirSesion, pintar } from './puerta';

function sello(bloque: Bloque): string {
  return bloque.es_prueba
    ? `<p class="app-sello-prueba">Datos de prueba. No es un programa de Yohan.</p>`
    : '';
}

async function appAbiertaEnBase(): Promise<boolean> {
  if (!supabaseNavegadorListo()) return false;
  const { data, error } = await supabaseNavegador()
    .from('configuracion')
    .select('valor')
    .eq('clave', 'app_abierta_al_publico')
    .maybeSingle();
  if (error) return false;
  return data?.valor === 'true';
}

export async function iniciarBloques(): Promise<void> {
  const raiz = document.getElementById('app-raiz');
  if (!raiz) return;
  if (!supabaseNavegadorListo()) {
    if (!sitio.app.abiertaAlPublico) {
      document.body.classList.add('app-sin-nav');
      pintar(
        raiz,
        `<h1>Aún no está abierta</h1>
         <p>Esta app sigue cerrada al público. No es un coaching ni un programa a tu medida.</p>
         <p class="app-aviso">Para probarla faltan PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY.</p>`,
      );
      return;
    }
    pintar(
      raiz,
      `<p class="app-aviso">Falta configurar PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY. La app no puede entrar a la base.</p>`,
    );
    return;
  }
  const {
    data: { session },
  } = await supabaseNavegador().auth.getSession();
  if (!session) {
    const abierta = sitio.app.abiertaAlPublico && (await appAbiertaEnBase());
    if (!abierta) {
      document.body.classList.add('app-sin-nav');
      pintar(
        raiz,
        `<h1>Aún no está abierta</h1>
         <p>Esta app sigue cerrada al público. No es un coaching ni un programa a tu medida. Cuando los socios la abran, aquí vas a registrar los bloques de Yohan y tus cargas.</p>
         <p>Si te invitaron a probarla, entra con tu cuenta.</p>
         <p><a class="boton app-boton-grande" href="/app/entrar">Entrar</a></p>`,
      );
      return;
    }
  }
  const sesion = await abrirSesion(raiz);
  if (!sesion) return;
  const { supabase, usuarioId } = sesion;

  const [{ data: bloques }, { data: progresos }, { data: abierta }] = await Promise.all([
    supabase.from('bloques').select('*').eq('publicado', true).order('orden'),
    supabase.from('progreso_bloque').select('*').eq('usuario_id', usuarioId),
    supabase
      .from('entrenamientos')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('estado', 'abierta')
      .order('iniciado_en', { ascending: false })
      .limit(1),
  ]);

  const lista = (bloques ?? []) as Bloque[];
  const avance = (progresos ?? []) as ProgresoBloque[];
  const ids = lista.map((bloque) => bloque.id);
  const { data: sesiones } = ids.length
    ? await supabase.from('sesiones_bloque').select('*').in('bloque_id', ids).order('posicion')
    : { data: [] };
  const sesionesLista = (sesiones ?? []) as SesionBloque[];

  function siguienteDe(bloque: Bloque): SesionBloque | null {
    const delBloque = sesionesLista
      .filter((item) => item.bloque_id === bloque.id)
      .sort((a, b) => a.posicion - b.posicion);
    const progreso = avance.find((item) => item.bloque_id === bloque.id);
    if (!progreso || progreso.estado === 'en_curso') {
      if (progreso?.sesion_id) {
        return delBloque.find((item) => item.id === progreso.sesion_id) ?? delBloque[0] ?? null;
      }
      return delBloque[0] ?? null;
    }
    return null;
  }

  const destacado = lista
    .map((bloque) => ({ bloque, siguiente: siguienteDe(bloque) }))
    .find((item) => item.siguiente && avance.some((p) => p.bloque_id === item.bloque.id && p.estado === 'en_curso'));

  const avisoPublico = sitio.app.abiertaAlPublico
    ? ''
    : `<p class="app-aviso">La app sigue cerrada al público. Estás dentro porque tu cuenta tiene acceso de prueba.</p>`;
  const avisoAbierta =
    abierta && abierta.length > 0
      ? `<p><a class="boton app-boton-grande" href="/app/sesion?id=${abierta[0].id}">Seguir la sesión abierta</a></p>`
      : '';

  const tarjetas = lista
    .map((bloque) => {
      const siguiente = siguienteDe(bloque);
      const enCurso = destacado?.bloque.id === bloque.id;
      const estado = avance.find((item) => item.bloque_id === bloque.id);
      const pie = estado?.estado === 'terminado'
        ? 'Ya terminaste este bloque. Puedes repetirlo cuando quieras.'
        : siguiente
          ? `Siguiente: sesión ${siguiente.posicion}. ${siguiente.objetivo}`
          : 'Aún no hay sesiones cargadas.';
      const href = siguiente ? `/app/sesion?bloque=${bloque.id}&sesion=${siguiente.id}` : '/app';
      return `<li>
        <a class="app-tarjeta${enCurso ? ' app-actual' : ''}" href="${href}">
          ${sello(bloque)}
          <h2>${escapar(bloque.nombre)}</h2>
          <p>${escapar(bloque.descripcion)}</p>
          <p class="app-meta">${escapar(pie)}</p>
        </a>
      </li>`;
    })
    .join('');

  pintar(
    raiz,
    `${avisoPublico}
     <h1>Mis bloques</h1>
     <p>Son bloques generales, los mismos para cualquiera. Elige uno y anota lo que hagas. Esto no es un programa armado para ti.</p>
     ${avisoAbierta}
     <p><a class="boton boton-secundario app-boton-grande" href="/app/sesion?libre=1">Registrar una sesión libre</a></p>
     ${lista.length === 0 ? '<p class="app-vacia">Todavía no hay bloques publicados. Carga los JSON de prueba con <code>npm run bloques</code>.</p>' : `<ul class="app-lista">${tarjetas}</ul>`}`,
  );
}
