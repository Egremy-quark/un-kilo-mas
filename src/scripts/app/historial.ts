import { escapar, fechaCorta, kg } from '../../lib/app/html';
import type { Entrenamiento, SerieRegistrada } from '../../lib/app/tipos';
import { abrirSesion, pintar } from './puerta';
import { leerDecimal, leerEntero } from '../../lib/formato';

export async function iniciarHistorial(): Promise<void> {
  const caja = document.getElementById('app-raiz');
  if (!caja) return;
  const abierta = await abrirSesion(caja);
  if (!abierta) return;
  const { supabase, usuarioId } = abierta;

  async function cargar(): Promise<void> {
    const { data: entrenamientos } = await supabase
      .from('entrenamientos')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('iniciado_en', { ascending: false })
      .range(0, 49);
    const lista = (entrenamientos ?? []) as Entrenamiento[];
    const ids = lista.map((item) => item.id);
    const { data: series } = ids.length
      ? await supabase.from('series_registradas').select('*').in('entrenamiento_id', ids)
      : { data: [] };
    const seriesLista = (series ?? []) as SerieRegistrada[];

    if (lista.length === 0) {
      pintar(caja, `<h1>Historial</h1><p class="app-vacia">Aún no cierras una sesión.</p>`);
      return;
    }

    const tarjetas = lista
      .map((item) => {
        const delDia = seriesLista.filter((serie) => serie.entrenamiento_id === item.id);
        const resumen = [...new Set(delDia.map((serie) => serie.ejercicio))]
          .map((ejercicio) => {
            const deEste = delDia.filter((serie) => serie.ejercicio === ejercicio);
            const mejor = Math.max(...deEste.map((serie) => Number(serie.peso_kg)));
            return `${escapar(ejercicio)} ${kg(mejor)} kg`;
          })
          .join(' · ');
        const filas = delDia
          .map(
            (serie) => `<li>
              <form class="app-form" data-editar="${serie.id}">
                <p><strong>${escapar(serie.ejercicio)}</strong> · serie ${serie.numero_serie}</p>
                <div class="app-serie">
                  <label>Peso (kg)
                    <input name="peso" type="text" inputmode="decimal" value="${kg(Number(serie.peso_kg))}" />
                  </label>
                  <label>Repeticiones
                    <input name="reps" type="text" inputmode="numeric" value="${serie.repeticiones}" />
                  </label>
                </div>
                <label><input type="checkbox" name="completada" ${serie.completada ? 'checked' : ''} /> Completada</label>
                <button class="boton boton-compacto" type="submit">Guardar</button>
                <button class="boton boton-secundario boton-compacto" type="button" data-borrar-serie="${serie.id}">Borrar serie</button>
              </form>
            </li>`,
          )
          .join('');
        return `<li class="app-tarjeta">
          <h2>${fechaCorta(item.iniciado_en)}</h2>
          <p class="app-meta">${item.estado === 'cerrada' ? 'Cerrada' : 'Abierta'}${item.bloque_id ? '' : ' · libre'} · ${resumen || 'sin series'}</p>
          <ul class="app-resumen">${filas}</ul>
          <button class="boton boton-secundario app-boton-grande" type="button" data-borrar="${item.id}">Borrar sesión</button>
        </li>`;
      })
      .join('');

    pintar(
      caja,
      `<h1>Historial</h1>
       <p>Solo tú ves y editas estas sesiones.</p>
       <ul class="app-lista">${tarjetas}</ul>`,
    );
  }

  caja.addEventListener('submit', async (evento) => {
    const form = evento.target as HTMLFormElement;
    if (!(form instanceof HTMLFormElement) || !form.dataset.editar) return;
    evento.preventDefault();
    const datos = new FormData(form);
    const peso = leerDecimal(String(datos.get('peso') ?? ''));
    const reps = leerEntero(String(datos.get('reps') ?? ''));
    if (peso === null || reps === null) return;
    await supabase
      .from('series_registradas')
      .update({
        peso_kg: peso,
        repeticiones: reps,
        completada: datos.get('completada') === 'on',
      })
      .eq('id', form.dataset.editar);
    await cargar();
  });

  caja.addEventListener('click', async (evento) => {
    const objetivo = evento.target as HTMLElement;
    const borrarSerie = objetivo.closest('[data-borrar-serie]') as HTMLElement | null;
    const borrar = objetivo.closest('[data-borrar]') as HTMLElement | null;
    if (borrarSerie?.dataset.borrarSerie) {
      await supabase.from('series_registradas').delete().eq('id', borrarSerie.dataset.borrarSerie);
      await cargar();
    }
    if (borrar?.dataset.borrar) {
      await supabase.from('entrenamientos').delete().eq('id', borrar.dataset.borrar);
      await cargar();
    }
  });

  await cargar();
}
