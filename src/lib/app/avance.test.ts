import { describe, expect, it } from 'vitest';
import { cifrasDeEjercicio, ejerciciosRegistrados, trazoSvg } from './avance';
import { resumenContraAnterior } from './registro';
import type { Entrenamiento, SerieRegistrada } from './tipos';

const ahora = new Date('2026-11-14T12:00:00Z');

function ent(id: string, dia: string, estado: Entrenamiento['estado'] = 'cerrada'): Entrenamiento {
  return {
    id,
    usuario_id: 'u1',
    bloque_id: null,
    sesion_id: null,
    estado,
    iniciado_en: `${dia}T10:00:00Z`,
    cerrado_en: estado === 'cerrada' ? `${dia}T11:00:00Z` : null,
  };
}

function serie(
  entrenamiento_id: string,
  ejercicio: string,
  peso_kg: number,
  repeticiones: number,
  numero_serie = 1,
): SerieRegistrada {
  return {
    id: `${entrenamiento_id}-${ejercicio}-${numero_serie}`,
    entrenamiento_id,
    ejercicio,
    numero_serie,
    peso_kg,
    repeticiones,
    completada: true,
  };
}

describe('dashboard', () => {
  const entrenamientos = [
    ent('a', '2026-11-14'),
    ent('b', '2026-11-10'),
    ent('c', '2026-10-20'),
  ];
  const series = [
    serie('a', 'Ejercicio de prueba 1', 40, 5),
    serie('a', 'Ejercicio de prueba 1', 42.5, 5, 2),
    serie('b', 'Ejercicio de prueba 1', 40, 5),
    serie('c', 'Ejercicio de prueba 1', 35, 5),
    serie('a', 'Ejercicio de prueba 2', 20, 8),
  ];

  it('cuenta sesiones de la semana y del mes, y calcula mejor serie y volumen', () => {
    const cifras = cifrasDeEjercicio(entrenamientos, series, 'Ejercicio de prueba 1', ahora);
    expect(cifras.sesionesSemana).toBe(2);
    expect(cifras.sesionesMes).toBe(2);
    expect(cifras.mejorSerieKg).toBe(42.5);
    expect(cifras.mejorSerieReps).toBe(5);
    expect(cifras.volumenKg).toBe(42.5 * 5 + 40 * 5 + 40 * 5 + 35 * 5);
    expect(cifras.puntos.map((punto) => [punto.fecha, punto.pesoKg])).toEqual([
      ['2026-10-20', 35],
      ['2026-11-10', 40],
      ['2026-11-14', 42.5],
    ]);
  });

  it('lista ejercicios sin importar el bloque', () => {
    expect(ejerciciosRegistrados(series)).toEqual(['Ejercicio de prueba 1', 'Ejercicio de prueba 2']);
  });

  it('dibuja la curva de carga', () => {
    const cifras = cifrasDeEjercicio(entrenamientos, series, 'Ejercicio de prueba 1', ahora);
    expect(trazoSvg(cifras.puntos)).toMatch(/^M/);
  });
});

describe('resumen contra la vez anterior', () => {
  it('compara el mejor peso del mismo ejercicio', () => {
    const hoy = [serie('hoy', 'Ejercicio de prueba 1', 45, 5)];
    const antes = [serie('antes', 'Ejercicio de prueba 1', 40, 5)];
    const resumen = resumenContraAnterior(hoy, antes);
    expect(resumen[0]?.mejorKg).toBe(45);
    expect(resumen[0]?.anteriorKg).toBe(40);
    expect(resumen[0]?.diferenciaKg).toBe(5);
  });
});
