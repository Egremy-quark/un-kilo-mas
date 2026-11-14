import { formatearNumero } from '../lib/formato';

/**
 * Referencias visibles de las calculadoras.
 * Solo las cuatro fuentes pedidas. Epley y Brzycki no tienen enlace verificado:
 * se listan sin URL. No inventar autores, años ni revistas.
 */
export interface FuentePublica {
  id: string;
  texto: string;
  url?: string;
}

export const FUENTES: FuentePublica[] = [
  { id: 'epley', texto: 'Epley (1985) — fórmula de 1RM.' },
  { id: 'brzycki', texto: 'Brzycki (1993) — fórmula de 1RM.' },
  {
    id: 'morton',
    texto:
      'Morton et al. (2018) — proteína 1,6–2,2 g/kg/día. British Journal of Sports Medicine, meta-análisis de 49 estudios.',
    url: 'https://doi.org/10.1136/bjsports-2017-097608',
  },
  {
    id: 'mifflin',
    texto: 'Mifflin-St Jeor (1990) — gasto energético en reposo.',
    url: 'https://doi.org/10.1093/ajcn/51.2.241',
  },
];

/** Hasta 2 decimales, solo para mostrar el valor de cada fórmula. No cambia el 1RM. */
function mostrarFormula(valor: number): string {
  return formatearNumero(Number(valor.toFixed(2)));
}

/**
 * 100 kg × 5 sigue en 115 kg (redondeo de la calculadora al paso de 2.5).
 * Epley real ≈ 116.67 y Brzycki real = 112.5. No se muestran como 117 y 113:
 * eso sería otro redondeo.
 */
export function lineas1rm(epley: number, brzycki: number, promedio: number, unidad: string): string[] {
  return [
    'Promedio de Epley (1985) y Brzycki (1993).',
    `Epley ${mostrarFormula(epley)} ${unidad}. Brzycki ${mostrarFormula(brzycki)} ${unidad}. Promedio ${formatearNumero(promedio)} ${unidad}.`,
    'Epley: 1RM = peso × (1 + repeticiones / 30)',
    'Brzycki: 1RM = peso × 36 / (37 − repeticiones)',
  ];
}

export function lineasProteina(minimo: number, maximo: number): string[] {
  const desde = String(minimo).replace('.', ',');
  const hasta = String(maximo).replace('.', ',');
  return [
    `Rango de Morton et al. (2018): ${desde}–${hasta} g por kilo al día.`,
    `${desde}–${hasta} g/kg/día.`,
  ];
}

/**
 * Los factores son los de la calculadora: 1.2, 1.375, 1.55, 1.725 y 1.9.
 * En el selector, 1.725 y 1.9 se llaman «activo» y «muy activo».
 * Esta línea usa el texto pedido para la referencia y no cambia esos factores.
 */
export const LINEAS_CALORIAS: string[] = [
  'Con la fórmula de Mifflin-St Jeor (1990).',
  'Hombres: TMB = 10 × peso (kg) + 6,25 × estatura (cm) − 5 × edad + 5',
  'Mujeres: TMB = 10 × peso (kg) + 6,25 × estatura (cm) − 5 × edad − 161',
  'Actividad: sedentario 1,2 · ligero 1,375 · moderado 1,55 · intenso 1,725 · muy intenso 1,9.',
];
