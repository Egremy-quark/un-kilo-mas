import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { leerBloqueArchivo } from './esquema-bloque';

describe('bloques desde datos', () => {
  const archivos = readdirSync('src/datos/bloques').filter((nombre) => nombre.endsWith('.json'));

  it('carga cualquier JSON de la carpeta sin código extra', () => {
    expect(archivos.length).toBeGreaterThan(0);
    for (const archivo of archivos) {
      const bloque = leerBloqueArchivo(
        JSON.parse(readFileSync(`src/datos/bloques/${archivo}`, 'utf8')),
        archivo,
      );
      expect(bloque.clave).toBeTruthy();
      expect(bloque.sesiones.length).toBeGreaterThan(0);
    }
  });

  it('marca los bloques de desarrollo como prueba', () => {
    for (const archivo of archivos) {
      const bloque = leerBloqueArchivo(
        JSON.parse(readFileSync(`src/datos/bloques/${archivo}`, 'utf8')),
        archivo,
      );
      expect(bloque.es_prueba).toBe(true);
      expect(bloque.nombre.toLowerCase()).toContain('prueba');
    }
  });

  it('acepta un bloque nuevo solo con el JSON', () => {
    const bloque = leerBloqueArchivo({
      clave: 'prueba-nuevo',
      nombre: 'Bloque de prueba nuevo',
      descripcion: 'Se carga sin tocar código.',
      orden: 9,
      publicado: true,
      es_prueba: true,
      sesiones: [
        {
          posicion: 1,
          objetivo: 'Comprobar la generalidad.',
          ejercicios: [
            {
              ejercicio: 'Ejercicio cualquiera',
              orden: 1,
              series_previstas: 2,
              repeticiones_previstas: 5,
              nota_tecnica: '[CONTENIDO POR YOHAN]',
            },
          ],
        },
      ],
    });
    expect(bloque.clave).toBe('prueba-nuevo');
    expect(bloque.sesiones[0]?.ejercicios[0]?.ejercicio).toBe('Ejercicio cualquiera');
  });
});
