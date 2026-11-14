import { escapar, kg } from '../../lib/app/html';
import { entrenamientoAnteriorDelMismoEjercicio, resumenContraAnterior } from '../../lib/app/registro';
import type {
  Bloque,
  EjercicioSesion,
  Entrenamiento,
  SerieRegistrada,
  SesionBloque,
} from '../../lib/app/tipos';
import { abrirSesion, pintar } from './puerta';
import { leerDecimal, leerEntero } from '../../lib/formato';

interface Plan {
  bloque: Bloque | null;
  sesion: SesionBloque | null;
  ejercicios: EjercicioSesion[];
}

function raiz(): HTMLElement {
  return document.getElementById('app-raiz') as HTMLElement;
}

function params(): URLSearchParams {
  return new URLSearchParams(location.search);
}

function planHtml(plan: Plan): string {
  if (plan.ejercicios.length === 0) {
    return `<p>Sesión libre: anota el ejercicio, el peso en kg y las repeticiones. Sirve para cualquier movimiento.</p>`;
  }
  return `<ol class="app-plan">${plan.ejercicios
    .map(
      (item) => `<li>
        <strong>${escapar(item.ejercicio)}</strong>
        <p>${item.series_previstas} series × ${item.repeticiones_previstas} repeticiones</p>
        <p class="nota">${escapar(item.nota_tecnica)}</p>
      </li>`,
    )
    .join('')}</ol>`;
}

function camposSerie(reps: number, ejercicio?: string): string {
  const oculto = ejercicio
    ? `<input type="hidden" name="ejercicio" value="${escapar(ejercicio)}" />`
    : '';
  return `
    <div class="app-serie">
      <label>Peso (kg)
        <input name="peso" type="text" inputmode="decimal" value="" required />
      </label>
      <label>Repeticiones
        <input name="reps" type="text" inputmode="numeric" value="${reps}" required />
      </label>
    </div>
    ${oculto}
    <label><input type="checkbox" name="completada" checked /> Serie completada</label>
    <button class="boton app-boton-grande" type="submit">Anotar serie</button>
  `;
}

export async function iniciarSesion(): Promise<void> {
  const caja = raiz();
  const abierta = await abrirSesion(caja);
  if (!abierta) return;
  const { supabase, usuarioId } = abierta;
  const q = params();

  let entrenamiento: Entrenamiento | null = null;
  if (q.get('id')) {
    const { data } = await supabase.from('entrenamientos').select('*').eq('id', q.get('id')).single();
    entrenamiento = data as Entrenamiento | null;
    if (!entrenamiento) {
      pintar(caja, `<p class="app-error">No encontramos esa sesión. Solo puedes abrir las tuyas.</p>`);
      return;
    }
  } else if (!q.get('bloque') && !q.get('sesion') && q.get('libre') !== '1') {
    const { data: abiertaHoy } = await supabase
      .from('entrenamientos')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('estado', 'abierta')
      .order('iniciado_en', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (abiertaHoy) {
      location.replace(`/app/sesion?id=${abiertaHoy.id}`);
      return;
    }
    const { data: progreso } = await supabase
      .from('progreso_bloque')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('estado', 'en_curso')
      .limit(1)
      .maybeSingle();
    if (progreso?.bloque_id && progreso.sesion_id) {
      location.replace(`/app/sesion?bloque=${progreso.bloque_id}&sesion=${progreso.sesion_id}`);
      return;
    }
    pintar(
      caja,
      `<h1>Hoy</h1>
       <p>Elige un bloque para ver qué te toca, o registra una sesión libre.</p>
       <div class="app-acciones">
         <a class="boton app-boton-grande" href="/app">Ver bloques</a>
         <a class="boton boton-secundario app-boton-grande" href="/app/sesion?libre=1">Sesión libre</a>
       </div>`,
    );
    return;
  }

  const plan: Plan = { bloque: null, sesion: null, ejercicios: [] };
  const bloqueId = q.get('bloque') ?? entrenamiento?.bloque_id;
  const sesionId = q.get('sesion') ?? entrenamiento?.sesion_id;
  const libre = q.get('libre') === '1' || Boolean(entrenamiento && !entrenamiento.bloque_id && !entrenamiento.sesion_id);

  if (bloqueId) {
    const { data } = await supabase.from('bloques').select('*').eq('id', bloqueId).single();
    plan.bloque = data as Bloque | null;
  }
  if (sesionId) {
    const { data } = await supabase.from('sesiones_bloque').select('*').eq('id', sesionId).single();
    plan.sesion = data as SesionBloque | null;
    const { data: ejercicios } = await supabase
      .from('ejercicios_sesion')
      .select('*')
      .eq('sesion_id', sesionId)
      .order('orden');
    plan.ejercicios = (ejercicios ?? []) as EjercicioSesion[];
  }

  const sello = plan.bloque?.es_prueba
    ? `<p class="app-sello-prueba">Datos de prueba. No es un programa de Yohan.</p>`
    : '';
  const titulo = libre
    ? 'Sesión libre'
    : plan.sesion
      ? `Hoy: sesión ${plan.sesion.posicion}`
      : 'Sesión de hoy';
  const objetivo = plan.sesion?.objetivo ?? 'Anota lo que entrenes, con peso en kg y repeticiones.';

  async function seriesDe(id: string): Promise<SerieRegistrada[]> {
    const { data } = await supabase.from('series_registradas').select('*').eq('entrenamiento_id', id);
    return (data ?? []) as SerieRegistrada[];
  }

  function indiceActual(series: SerieRegistrada[]): { ejercicio: EjercicioSesion; numero: number } | null {
    for (const ejercicio of plan.ejercicios) {
      const hechas = series.filter((serie) => serie.ejercicio === ejercicio.ejercicio).length;
      if (hechas < ejercicio.series_previstas) {
        return { ejercicio, numero: hechas + 1 };
      }
    }
    return null;
  }

  async function pintarRegistro(): Promise<void> {
    if (!entrenamiento) return;
    const series = await seriesDe(entrenamiento.id);
    const actual = indiceActual(series);
    const lista = series
      .map(
        (serie) =>
          `<li>${escapar(serie.ejercicio)} · serie ${serie.numero_serie}: ${kg(Number(serie.peso_kg))} kg × ${serie.repeticiones}${serie.completada ? '' : ' (no completada)'}</li>`,
      )
      .join('');

    if (entrenamiento.estado === 'cerrada') {
      await pintarResumen(series);
      return;
    }

    const formulario = actual
      ? `<form class="app-form" data-fase="serie">
           <p class="app-cifra">${actual.numero}<small>/${actual.ejercicio.series_previstas}</small></p>
           <h2>${escapar(actual.ejercicio.ejercicio)}</h2>
           <p>Objetivo: ${actual.ejercicio.repeticiones_previstas} repeticiones. Peso en kilogramos.</p>
           ${camposSerie(actual.ejercicio.repeticiones_previstas, actual.ejercicio.ejercicio)}
         </form>`
      : libre
        ? `<form class="app-form" data-fase="libre">
             <label>Ejercicio
               <input name="ejercicio" type="text" required placeholder="Nombre del ejercicio" />
             </label>
             ${camposSerie(5)}
           </form>`
        : `<p>Ya anotaste las series previstas. Cierra la sesión para ver el resumen.</p>`;

    pintar(
      caja,
      `${sello}
       <h1>${titulo}</h1>
       <p>${escapar(objetivo)}</p>
       ${planHtml(plan)}
       <h2>Lo que vas anotando</h2>
       ${lista ? `<ul class="app-resumen">${lista}</ul>` : '<p class="app-vacia">Todavía no hay series.</p>'}
       ${formulario}
       <div class="app-acciones">
         <button class="boton boton-secundario app-boton-grande" type="button" data-cerrar>Cerrar sesión</button>
       </div>`,
    );
  }

  async function pintarResumen(hoy: SerieRegistrada[]): Promise<void> {
    if (!entrenamiento) return;
    const { data: previos } = await supabase
      .from('entrenamientos')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('estado', 'cerrada')
      .neq('id', entrenamiento.id)
      .order('iniciado_en', { ascending: false })
      .limit(20);
    const anteriores = (previos ?? []) as Entrenamiento[];
    const ids = anteriores.map((item) => item.id);
    const { data: seriesPrevias } = ids.length
      ? await supabase.from('series_registradas').select('*').in('entrenamiento_id', ids)
      : { data: [] };
    const todas = (seriesPrevias ?? []) as SerieRegistrada[];

    const resumen = [...new Set(hoy.map((serie) => serie.ejercicio))].flatMap((ejercicio) => {
      const previo = entrenamientoAnteriorDelMismoEjercicio(
        entrenamiento,
        [...anteriores, entrenamiento],
        [...todas, ...hoy],
        ejercicio,
      );
      return resumenContraAnterior(
        hoy.filter((serie) => serie.ejercicio === ejercicio),
        previo,
      );
    });

    const lineas = resumen
      .map((item) => {
        const delta =
          item.diferenciaKg === null
            ? 'Primera vez que lo registras.'
            : item.diferenciaKg === 0
              ? 'Misma carga que la vez anterior.'
              : item.diferenciaKg > 0
                ? `Subiste ${kg(item.diferenciaKg)} kg respecto a la vez anterior.`
                : `Bajaste ${kg(Math.abs(item.diferenciaKg))} kg respecto a la vez anterior.`;
        return `<li><strong>${escapar(item.ejercicio)}</strong><p class="app-cifra">${kg(item.mejorKg)}<small>kg</small></p><p>${delta}</p></li>`;
      })
      .join('');

    pintar(
      caja,
      `<h1>Así quedó hoy</h1>
       <p>Esto es un registro, no un diagnóstico.</p>
       ${lineas ? `<ul class="app-resumen">${lineas}</ul>` : '<p>No anotaste series.</p>'}
       <div class="app-acciones">
         <a class="boton app-boton-grande" href="/app/avance">Ver mi avance</a>
         <a class="boton boton-secundario app-boton-grande" href="/app">Volver a los bloques</a>
       </div>`,
    );
  }

  async function avanzarProgreso(): Promise<void> {
    if (!plan.bloque || !plan.sesion) return;
    const { data: sesiones } = await supabase
      .from('sesiones_bloque')
      .select('*')
      .eq('bloque_id', plan.bloque.id)
      .order('posicion');
    const lista = (sesiones ?? []) as SesionBloque[];
    const indice = lista.findIndex((item) => item.id === plan.sesion?.id);
    const siguiente = lista[indice + 1];
    await supabase.from('progreso_bloque').upsert({
      usuario_id: usuarioId,
      bloque_id: plan.bloque.id,
      sesion_id: siguiente?.id ?? plan.sesion.id,
      estado: siguiente ? 'en_curso' : 'terminado',
      actualizado_en: new Date().toISOString(),
    });
  }

  async function cerrar(): Promise<void> {
    if (!entrenamiento) return;
    await supabase
      .from('entrenamientos')
      .update({ estado: 'cerrada', cerrado_en: new Date().toISOString() })
      .eq('id', entrenamiento.id);
    entrenamiento.estado = 'cerrada';
    await avanzarProgreso();
    await pintarResumen(await seriesDe(entrenamiento.id));
  }

  caja.addEventListener('click', async (evento) => {
    const boton = (evento.target as HTMLElement).closest('[data-cerrar]');
    if (boton) await cerrar();
  });

  caja.addEventListener('submit', async (evento) => {
    const form = evento.target as HTMLFormElement;
    if (!(form instanceof HTMLFormElement) || !entrenamiento) return;
    evento.preventDefault();
    const datos = new FormData(form);
    const ejercicio =
      form.dataset.fase === 'libre'
        ? String(datos.get('ejercicio') ?? '').trim()
        : String(datos.get('ejercicio') ?? '').trim();
    const peso = leerDecimal(String(datos.get('peso') ?? ''));
    const reps = leerEntero(String(datos.get('reps') ?? ''));
    if (!ejercicio || peso === null || reps === null) return;
    const series = await seriesDe(entrenamiento.id);
    const numero = series.filter((serie) => serie.ejercicio === ejercicio).length + 1;
    const { error } = await supabase.from('series_registradas').insert({
      entrenamiento_id: entrenamiento.id,
      ejercicio,
      numero_serie: numero,
      peso_kg: peso,
      repeticiones: reps,
      completada: datos.get('completada') === 'on',
    });
    if (error) {
      pintar(caja, `<p class="app-error">No se pudo guardar la serie.</p>`);
      return;
    }
    await pintarRegistro();
  });

  if (!entrenamiento) {
    pintar(
      caja,
      `${sello}
       <h1>${titulo}</h1>
       <p>${escapar(objetivo)}</p>
       ${planHtml(plan)}
       <div class="app-acciones">
         <button class="boton app-boton-grande" type="button" data-empezar>Empezar</button>
         <a class="boton boton-secundario app-boton-grande" href="/app">Elegir otro bloque</a>
       </div>`,
    );
    caja.querySelector('[data-empezar]')?.addEventListener('click', async () => {
      const { data, error } = await supabase
        .from('entrenamientos')
        .insert({
          usuario_id: usuarioId,
          bloque_id: libre ? null : plan.bloque?.id ?? null,
          sesion_id: libre ? null : plan.sesion?.id ?? null,
          estado: 'abierta',
        })
        .select('*')
        .single();
      if (error || !data) {
        pintar(caja, `<p class="app-error">No se pudo abrir la sesión.</p>`);
        return;
      }
      entrenamiento = data as Entrenamiento;
      history.replaceState({}, '', `/app/sesion?id=${entrenamiento.id}`);
      if (plan.bloque && plan.sesion) {
        await supabase.from('progreso_bloque').upsert({
          usuario_id: usuarioId,
          bloque_id: plan.bloque.id,
          sesion_id: plan.sesion.id,
          estado: 'en_curso',
          actualizado_en: new Date().toISOString(),
        });
      }
      await pintarRegistro();
    });
    return;
  }

  await pintarRegistro();
}
