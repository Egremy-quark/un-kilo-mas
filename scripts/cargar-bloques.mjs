/**
 * Carga los JSON de src/datos/bloques a Supabase.
 * Un archivo nuevo basta: no hay que tocar la app.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

function cargarEnv() {
  try {
    const texto = readFileSync(join(raiz, '.env'), 'utf8');
    for (const linea of texto.split('\n')) {
      const match = linea.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match) continue;
      const valor = match[2].trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[match[1]]) process.env[match[1]] = valor;
    }
  } catch {
    /* .env opcional en CI */
  }
}

cargarEnv();

const url = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !clave) {
  console.error('Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, clave, { auth: { persistSession: false } });
const carpeta = join(raiz, 'src/datos/bloques');

function entero(valor) {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0 ? valor : null;
}

function leerBloque(crudo, archivo) {
  if (!crudo || typeof crudo !== 'object') throw new Error(`${archivo}: no es un objeto`);
  if (!crudo.clave || !crudo.nombre || !crudo.descripcion || !Array.isArray(crudo.sesiones)) {
    throw new Error(`${archivo}: faltan clave, nombre, descripcion o sesiones`);
  }
  return crudo;
}

const archivos = readdirSync(carpeta).filter((nombre) => nombre.endsWith('.json'));
if (archivos.length === 0) {
  console.error('No hay JSON en src/datos/bloques');
  process.exit(1);
}

for (const archivo of archivos) {
  const bloque = leerBloque(JSON.parse(readFileSync(join(carpeta, archivo), 'utf8')), archivo);
  const { data: guardado, error: errorBloque } = await supabase
    .from('bloques')
    .upsert(
      {
        clave: bloque.clave,
        nombre: bloque.nombre,
        descripcion: bloque.descripcion,
        orden: bloque.orden ?? 0,
        publicado: bloque.publicado !== false,
        es_prueba: bloque.es_prueba !== false,
      },
      { onConflict: 'clave' },
    )
    .select('id')
    .single();
  if (errorBloque || !guardado) {
    console.error(archivo, errorBloque?.message);
    process.exit(1);
  }

  const { data: sesionesViejas } = await supabase
    .from('sesiones_bloque')
    .select('id')
    .eq('bloque_id', guardado.id);
  const ids = (sesionesViejas ?? []).map((fila) => fila.id);
  if (ids.length > 0) {
    await supabase.from('ejercicios_sesion').delete().in('sesion_id', ids);
    await supabase.from('sesiones_bloque').delete().eq('bloque_id', guardado.id);
  }

  for (const sesion of bloque.sesiones) {
    const posicion = entero(sesion.posicion);
    if (!posicion || !sesion.objetivo) throw new Error(`${archivo}: sesión incompleta`);
    const { data: sesionGuardada, error: errorSesion } = await supabase
      .from('sesiones_bloque')
      .insert({ bloque_id: guardado.id, posicion, objetivo: sesion.objetivo })
      .select('id')
      .single();
    if (errorSesion || !sesionGuardada) {
      console.error(archivo, errorSesion?.message);
      process.exit(1);
    }
    const ejercicios = (sesion.ejercicios ?? []).map((ejercicio, indice) => ({
      sesion_id: sesionGuardada.id,
      ejercicio: ejercicio.ejercicio,
      orden: entero(ejercicio.orden) ?? indice + 1,
      series_previstas: entero(ejercicio.series_previstas),
      repeticiones_previstas: entero(ejercicio.repeticiones_previstas),
      nota_tecnica: ejercicio.nota_tecnica || '[CONTENIDO POR YOHAN]',
    }));
    if (ejercicios.some((item) => !item.ejercicio || !item.series_previstas || !item.repeticiones_previstas)) {
      throw new Error(`${archivo}: ejercicio incompleto`);
    }
    const { error: errorEj } = await supabase.from('ejercicios_sesion').insert(ejercicios);
    if (errorEj) {
      console.error(archivo, errorEj.message);
      process.exit(1);
    }
  }
  console.log(`Cargado ${bloque.clave} (${bloque.es_prueba ? 'prueba' : 'Yohan'})`);
}
