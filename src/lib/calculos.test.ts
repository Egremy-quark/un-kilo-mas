import { describe, expect, it } from 'vitest';
import { sitio } from '../config/sitio';
import {
  brzycki,
  calcular1rm,
  calcularCalorias,
  calcularProteina,
  caloriasSegunObjetivo,
  epley,
  mifflinStJeor,
} from './calculos';
import { enviarSuscripcion } from './correo';
import { enviarConMailerLite } from './correo.mailerlite';
import { formatearNumero } from './formato';

describe('formato', () => {
  it('usa espacio fino en los miles y punto en los decimales', () => {
    expect(formatearNumero(2450)).toBe('2\u202F450');
    expect(formatearNumero(2710)).toBe('2\u202F710');
    expect(formatearNumero(1820)).toBe('1\u202F820');
    expect(formatearNumero(115)).toBe('115');
    expect(formatearNumero(1.6)).toBe('1.6');
    expect(formatearNumero(112.5)).toBe('112.5');
  });
});

describe('1RM', () => {
  it('100 kg × 5 promedia Epley y Brzycki y redondea a 115 kg', () => {
    expect(epley(100, 5)).toBeCloseTo(116.67, 2);
    expect(brzycki(100, 5)).toBe(112.5);

    const resultado = calcular1rm({ peso: 100, repeticiones: 5, unidad: 'kg' });
    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.resultado).toBe(115);
    expect(resultado.unidad).toBe('kg');
    expect(resultado.explicacion).toBe('Promedio de Epley y Brzycki con 100 kg × 5 repeticiones.');
    expect(resultado.cargas.map((carga) => [carga.porcentaje, carga.peso])).toEqual([
      [70, 80],
      [75, 87.5],
      [80, 92.5],
      [85, 97.5],
    ]);
  });

  it('con 1 repetición el 1RM es el peso', () => {
    const resultado = calcular1rm({ peso: 100, repeticiones: 1, unidad: 'kg' });
    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.resultado).toBe(100);
    expect(resultado.epley).toBe(100);
    expect(resultado.brzycki).toBe(100);
  });

  it('225 lb × 5 da 260 lb', () => {
    const resultado = calcular1rm({ peso: 225, repeticiones: 5, unidad: 'lb' });
    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.resultado).toBe(260);
  });

  it('no calcula con más de 10 repeticiones', () => {
    const resultado = calcular1rm({ peso: 100, repeticiones: 11, unidad: 'kg' });
    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;
    expect(resultado.mensaje).toMatch(/más de 10/);
  });
});

describe('proteína', () => {
  it('80 kg da un rango de 130 a 175 g', () => {
    const mantener = calcularProteina(80, 'mantener');
    expect(mantener.ok).toBe(true);
    if (!mantener.ok) return;
    expect(mantener.minimo).toBe(130);
    expect(mantener.maximo).toBe(175);
    expect(mantener.recomendado).toBe(130);
    expect(mantener.rangoTexto).toBe('Entre 130 y 175 g al día');

    const ganar = calcularProteina(80, 'ganar');
    expect(ganar.ok && ganar.recomendado).toBe(130);

    const bajar = calcularProteina(80, 'bajar');
    expect(bajar.ok && bajar.recomendado).toBe(175);
  });
});

describe('calorías', () => {
  it('hombre de 30 años, 80 kg, 175 cm, moderado: 2 710 kcal', () => {
    expect(mifflinStJeor('hombre', 80, 175, 30)).toBeCloseTo(1748.75, 2);
    const resultado = calcularCalorias({
      sexo: 'hombre',
      edad: 30,
      pesoKg: 80,
      estaturaCm: 175,
      actividad: 'moderado',
    });
    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.resultado).toBe(2710);
  });

  it('mujer de 30 años, 60 kg, 165 cm, ligero: 1 820 kcal', () => {
    expect(mifflinStJeor('mujer', 60, 165, 30)).toBeCloseTo(1320.25, 2);
    const resultado = calcularCalorias({
      sexo: 'mujer',
      edad: 30,
      pesoKg: 60,
      estaturaCm: 165,
      actividad: 'ligero',
    });
    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.resultado).toBe(1820);
  });

  it('no calcula si la edad es menor de 18', () => {
    const resultado = calcularCalorias({
      sexo: 'mujer',
      edad: 17,
      pesoKg: 60,
      estaturaCm: 165,
      actividad: 'ligero',
    });
    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;
    expect(resultado.mensaje).toMatch(/mayores de 18/);
  });

  it('deja preparado el ajuste por objetivo, sin números publicados', () => {
    expect(sitio.calculadoras.mostrarObjetivosCalorias).toBe(false);
    expect(caloriasSegunObjetivo(2710, 'bajar', null)).toBeNull();
    expect(caloriasSegunObjetivo(2710, 'mantener', { bajar: -400, subir: 250 })).toBe(2710);
    expect(caloriasSegunObjetivo(2710, 'bajar', { bajar: -400, subir: 250 })).toBe(2310);
  });
});

describe('correo', () => {
  it('anota el correo en la consola mientras no hay proveedor', async () => {
    const resultado = await enviarSuscripcion({
      correo: 'ana@correo.com',
      calculadora: '1rm',
      resultado: '115 kg',
      origen: { utm_source: 'instagram' },
    });
    expect(resultado.ok).toBe(true);
  });

  it('no llama a MailerLite si falta la clave', async () => {
    if (import.meta.env.MAILERLITE_API_KEY) return;
    await expect(
      enviarConMailerLite({
        correo: 'ana@correo.com',
        calculadora: '1rm',
        resultado: '115 kg',
        origen: {},
      }),
    ).rejects.toThrow(/MAILERLITE_API_KEY/);
  });
});
