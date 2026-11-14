import type { Entrenamiento, SerieRegistrada } from './tipos';

export interface ResumenEjercicio {
  ejercicio: string;
  series: number;
  mejorKg: number;
  anteriorKg: number | null;
  diferenciaKg: number | null;
}

export function seriesDeEntrenamiento(
  series: SerieRegistrada[],
  entrenamientoId: string,
): SerieRegistrada[] {
  return series.filter((serie) => serie.entrenamiento_id === entrenamientoId);
}

export function mejorPeso(series: SerieRegistrada[], ejercicio: string): number {
  return series
    .filter((serie) => serie.ejercicio === ejercicio && serie.completada)
    .reduce((mejor, serie) => Math.max(mejor, Number(serie.peso_kg)), 0);
}

export function resumenContraAnterior(
  hoy: SerieRegistrada[],
  anterior: SerieRegistrada[] | null,
): ResumenEjercicio[] {
  const ejercicios = [...new Set(hoy.map((serie) => serie.ejercicio))];
  return ejercicios.map((ejercicio) => {
    const mejorKg = mejorPeso(hoy, ejercicio);
    const anteriorKg = anterior ? mejorPeso(anterior, ejercicio) : null;
    const diferenciaKg =
      anteriorKg && anteriorKg > 0 ? Number((mejorKg - anteriorKg).toFixed(2)) : null;
    return {
      ejercicio,
      series: hoy.filter((serie) => serie.ejercicio === ejercicio).length,
      mejorKg,
      anteriorKg: anteriorKg && anteriorKg > 0 ? anteriorKg : null,
      diferenciaKg,
    };
  });
}

export function entrenamientoAnteriorDelMismoEjercicio(
  actual: Entrenamiento,
  entrenamientos: Entrenamiento[],
  series: SerieRegistrada[],
  ejercicio: string,
): SerieRegistrada[] | null {
  const previos = entrenamientos
    .filter(
      (item) =>
        item.id !== actual.id &&
        item.estado === 'cerrada' &&
        item.iniciado_en < actual.iniciado_en &&
        series.some((serie) => serie.entrenamiento_id === item.id && serie.ejercicio === ejercicio),
    )
    .sort((a, b) => (a.iniciado_en < b.iniciado_en ? 1 : -1));
  const previo = previos[0];
  if (!previo) return null;
  return series.filter((serie) => serie.entrenamiento_id === previo.id && serie.ejercicio === ejercicio);
}
