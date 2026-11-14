export interface OrigenTrafico {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}

const LLAVE = 'ukm_origen';
const CLAVES = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;

/** Primera visita de la sesión con UTM. No pisa un origen que ya estaba guardado. */
export function capturarOrigen(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const origen: OrigenTrafico = {};
    for (const clave of CLAVES) {
      const valor = params.get(clave);
      if (valor) origen[clave] = valor;
    }
    if (Object.keys(origen).length === 0) return;
    if (sessionStorage.getItem(LLAVE)) return;
    sessionStorage.setItem(LLAVE, JSON.stringify(origen));
  } catch {
    /* sessionStorage puede fallar en modo privado */
  }
}

export function leerOrigen(): OrigenTrafico {
  try {
    const crudo = sessionStorage.getItem(LLAVE);
    if (!crudo) return {};
    const datos: unknown = JSON.parse(crudo);
    if (!datos || typeof datos !== 'object') return {};
    const origen: OrigenTrafico = {};
    for (const clave of CLAVES) {
      const valor = (datos as Record<string, unknown>)[clave];
      if (typeof valor === 'string' && valor.length > 0) origen[clave] = valor;
    }
    return origen;
  } catch {
    return {};
  }
}
