import type { BloqueArchivo } from './tipos';

function texto(valor: unknown): string | null {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : null;
}

function entero(valor: unknown): number | null {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0 ? valor : null;
}

/** Un archivo JSON en src/datos/bloques basta para cargar un bloque. No hace falta tocar código. */
export function leerBloqueArchivo(crudo: unknown, archivo = 'bloque'): BloqueArchivo {
  if (!crudo || typeof crudo !== 'object') throw new Error(`${archivo}: el bloque no es un objeto`);
  const dato = crudo as Record<string, unknown>;
  const clave = texto(dato.clave);
  const nombre = texto(dato.nombre);
  const descripcion = texto(dato.descripcion);
  const orden = typeof dato.orden === 'number' ? dato.orden : null;
  if (!clave || !nombre || !descripcion || orden === null) {
    throw new Error(`${archivo}: faltan clave, nombre, descripcion u orden`);
  }
  if (!Array.isArray(dato.sesiones) || dato.sesiones.length === 0) {
    throw new Error(`${archivo}: hace falta al menos una sesión`);
  }

  const sesiones = dato.sesiones.map((sesionCruda, indice) => {
    if (!sesionCruda || typeof sesionCruda !== 'object') {
      throw new Error(`${archivo}: sesión ${indice + 1} inválida`);
    }
    const sesion = sesionCruda as Record<string, unknown>;
    const posicion = entero(sesion.posicion);
    const objetivo = texto(sesion.objetivo);
    if (!posicion || !objetivo) throw new Error(`${archivo}: sesión ${indice + 1} sin posición u objetivo`);
    if (!Array.isArray(sesion.ejercicios) || sesion.ejercicios.length === 0) {
      throw new Error(`${archivo}: sesión ${posicion} sin ejercicios`);
    }
    const ejercicios = sesion.ejercicios.map((ejercicioCrudo, i) => {
      if (!ejercicioCrudo || typeof ejercicioCrudo !== 'object') {
        throw new Error(`${archivo}: ejercicio inválido en sesión ${posicion}`);
      }
      const ejercicio = ejercicioCrudo as Record<string, unknown>;
      const nombreEjercicio = texto(ejercicio.ejercicio);
      const ordenEj = entero(ejercicio.orden) ?? i + 1;
      const series = entero(ejercicio.series_previstas);
      const reps = entero(ejercicio.repeticiones_previstas);
      const nota = texto(ejercicio.nota_tecnica) ?? '[CONTENIDO POR YOHAN]';
      if (!nombreEjercicio || !series || !reps) {
        throw new Error(`${archivo}: ejercicio incompleto en sesión ${posicion}`);
      }
      return {
        ejercicio: nombreEjercicio,
        orden: ordenEj,
        series_previstas: series,
        repeticiones_previstas: reps,
        nota_tecnica: nota,
      };
    });
    return { posicion, objetivo, ejercicios };
  });

  return {
    clave,
    nombre,
    descripcion,
    orden,
    publicado: dato.publicado !== false,
    es_prueba: dato.es_prueba !== false,
    sesiones,
  };
}
