import type { Entrenamiento, SerieRegistrada } from './tipos';

export interface PuntoCarga {
  fecha: string;
  pesoKg: number;
}

export interface CifrasAvance {
  sesionesSemana: number;
  sesionesMes: number;
  mejorSerieKg: number;
  mejorSerieReps: number;
  volumenKg: number;
  puntos: PuntoCarga[];
}

function enRango(fechaIso: string, desdeMs: number, hastaMs: number): boolean {
  const ms = new Date(fechaIso).getTime();
  return ms >= desdeMs && ms <= hastaMs;
}

function fechaDia(iso: string): string {
  return iso.slice(0, 10);
}

export function cifrasDeEjercicio(
  entrenamientos: Entrenamiento[],
  series: SerieRegistrada[],
  ejercicio: string,
  ahora = new Date(),
): CifrasAvance {
  const cerrados = entrenamientos.filter((item) => item.estado === 'cerrada');
  const semanaDesde = ahora.getTime() - 7 * 24 * 60 * 60 * 1000;
  const mesDesde = new Date(ahora.getFullYear(), ahora.getMonth(), 1).getTime();
  const hasta = ahora.getTime();

  const sesionesSemana = cerrados.filter((item) => enRango(item.iniciado_en, semanaDesde, hasta)).length;
  const sesionesMes = cerrados.filter((item) => enRango(item.iniciado_en, mesDesde, hasta)).length;

  const delEjercicio = series.filter((serie) => serie.ejercicio === ejercicio && serie.completada);
  const mejor = delEjercicio.reduce(
    (acc, serie) => {
      const peso = Number(serie.peso_kg);
      if (peso > acc.peso || (peso === acc.peso && serie.repeticiones > acc.reps)) {
        return { peso, reps: serie.repeticiones };
      }
      return acc;
    },
    { peso: 0, reps: 0 },
  );
  const volumenKg = delEjercicio.reduce(
    (suma, serie) => suma + Number(serie.peso_kg) * serie.repeticiones,
    0,
  );

  const porDia = new Map<string, number>();
  for (const serie of delEjercicio) {
    const entrenamiento = entrenamientos.find((item) => item.id === serie.entrenamiento_id);
    if (!entrenamiento) continue;
    const dia = fechaDia(entrenamiento.iniciado_en);
    const peso = Number(serie.peso_kg);
    porDia.set(dia, Math.max(porDia.get(dia) ?? 0, peso));
  }
  const puntos = [...porDia.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([fecha, pesoKg]) => ({ fecha, pesoKg }));

  return {
    sesionesSemana,
    sesionesMes,
    mejorSerieKg: mejor.peso,
    mejorSerieReps: mejor.reps,
    volumenKg,
    puntos,
  };
}

export function ejerciciosRegistrados(series: SerieRegistrada[]): string[] {
  return [...new Set(series.filter((serie) => serie.completada).map((serie) => serie.ejercicio))].sort(
    (a, b) => a.localeCompare(b, 'es'),
  );
}

export function trazoSvg(puntos: PuntoCarga[], ancho = 320, alto = 160): string {
  if (puntos.length === 0) return '';
  const pesos = puntos.map((punto) => punto.pesoKg);
  const min = Math.min(...pesos);
  const max = Math.max(...pesos);
  const rango = max - min || 1;
  const pasoX = puntos.length === 1 ? 0 : (ancho - 24) / (puntos.length - 1);
  return puntos
    .map((punto, indice) => {
      const x = 12 + indice * pasoX;
      const y = alto - 12 - ((punto.pesoKg - min) / rango) * (alto - 24);
      return `${indice === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}
