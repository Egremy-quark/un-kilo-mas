import { cifrasDeEjercicio, ejerciciosRegistrados, trazoSvg } from '../../lib/app/avance';
import { escapar, kg } from '../../lib/app/html';
import type { Entrenamiento, SerieRegistrada } from '../../lib/app/tipos';
import { abrirSesion, pintar } from './puerta';

export async function iniciarAvance(): Promise<void> {
  const caja = document.getElementById('app-raiz');
  if (!caja) return;
  const abierta = await abrirSesion(caja);
  if (!abierta) return;
  const { supabase, usuarioId } = abierta;

  const { data: entrenamientos } = await supabase
    .from('entrenamientos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .eq('estado', 'cerrada')
    .order('iniciado_en', { ascending: true })
    .range(0, 199);
  const lista = (entrenamientos ?? []) as Entrenamiento[];
  const ids = lista.map((item) => item.id);
  const { data: series } = ids.length
    ? await supabase.from('series_registradas').select('*').in('entrenamiento_id', ids)
    : { data: [] };
  const seriesLista = (series ?? []) as SerieRegistrada[];
  const ejercicios = ejerciciosRegistrados(seriesLista);

  if (lista.length === 0 || ejercicios.length === 0) {
    pintar(
      caja,
      `<h1>Mi avance</h1>
       <p class="app-vacia">Cuando cierres una sesión, aquí vas a ver cómo se mueve tu carga. La gráfica sirve para cualquier ejercicio que hayas anotado.</p>
       <p><a class="boton app-boton-grande" href="/app">Ir a bloques</a></p>`,
    );
    return;
  }

  function dibujar(ejercicio: string): void {
    const cifras = cifrasDeEjercicio(lista, seriesLista, ejercicio);
    const trazo = trazoSvg(cifras.puntos, 640, 220);
    const opciones = ejercicios
      .map((nombre) => `<option value="${escapar(nombre)}" ${nombre === ejercicio ? 'selected' : ''}>${escapar(nombre)}</option>`)
      .join('');
    const puntos = cifras.puntos
      .map((punto, indice) => {
        const pesos = cifras.puntos.map((item) => item.pesoKg);
        const min = Math.min(...pesos);
        const max = Math.max(...pesos);
        const rango = max - min || 1;
        const x = cifras.puntos.length === 1 ? 320 : 12 + indice * ((640 - 24) / (cifras.puntos.length - 1));
        const y = 220 - 12 - ((punto.pesoKg - min) / rango) * (220 - 24);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#7CB518" />`;
      })
      .join('');

    pintar(
      caja,
      `<h1>Mi avance</h1>
       <p>Las cifras salen de tus registros. Sirven igual para cualquier bloque y cualquier persona.</p>
       <p>Sesiones esta semana</p>
       <p class="app-cifra">${cifras.sesionesSemana}</p>
       <p>Sesiones este mes</p>
       <p class="app-cifra">${cifras.sesionesMes}</p>
       <label>Ejercicio
         <select class="app-select" name="ejercicio">${opciones}</select>
       </label>
       <p>Mejor serie</p>
       <p class="app-cifra">${kg(cifras.mejorSerieKg)}<small>kg × ${cifras.mejorSerieReps}</small></p>
       <p>Volumen total</p>
       <p class="app-cifra">${kg(cifras.volumenKg)}<small>kg</small></p>
       <p>Evolución de la carga</p>
       ${
         trazo
           ? `<svg class="app-grafica" viewBox="0 0 640 220" role="img" aria-label="Carga en el tiempo">
                <path d="${trazo}" fill="none" stroke="#7CB518" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" />
                ${puntos}
              </svg>`
           : '<p class="app-vacia">Aún no hay puntos para graficar.</p>'
       }
       <h2>Sesiones recientes</h2>
       <ul class="app-resumen">${lista
         .slice(-8)
         .reverse()
         .map((item) => {
           const delDia = seriesLista.filter((serie) => serie.entrenamiento_id === item.id);
           const mejor = Math.max(0, ...delDia.map((serie) => Number(serie.peso_kg)));
           return `<li>${new Date(item.iniciado_en).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} · mejor carga ${kg(mejor)} kg</li>`;
         })
         .join('')}</ul>`,
    );
  }

  dibujar(ejercicios[0] ?? '');
  caja.addEventListener('change', (evento) => {
    const select = evento.target as HTMLSelectElement;
    if (select.name === 'ejercicio') dibujar(select.value);
  });
}
