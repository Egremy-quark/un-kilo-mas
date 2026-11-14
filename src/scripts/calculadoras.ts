import { sitio } from '../config/sitio';
import {
  calcular1rm,
  calcularCalorias,
  calcularProteina,
  type Actividad,
  type Ejercicio,
  type ObjetivoProteina,
  type Sexo,
  type Unidad,
} from '../lib/calculos';
import { compartirResultado, type DatosTarjeta } from '../lib/compartir';
import { LINEAS_CALORIAS, lineas1rm, lineasProteina } from '../datos/fuentes';
import { formatearNumero, leerDecimal, leerEntero } from '../lib/formato';
import { medir } from '../lib/medicion';

type IdCalculadora = '1rm' | 'proteina' | 'calorias';

const IDS: IdCalculadora[] = ['1rm', 'proteina', 'calorias'];

interface ResultadoGuardado extends DatosTarjeta {
  valor: string;
  detalle: {
    rango: string;
    nota: string;
    parrafo: string;
    fuenteTexto: string;
    fuenteUrl: string;
    aviso: string;
    referencias: string[];
    cargas: { porcentaje: number; peso: number; unidad: string }[];
  };
}

const guardados = new Map<IdCalculadora, ResultadoGuardado>();
let activa: IdCalculadora = '1rm';
const yaCalculado = new Set<IdCalculadora>();

function tomar<T extends HTMLElement>(id: string): T {
  const nodo = document.getElementById(id);
  if (!nodo) throw new Error(`No está #${id}`);
  return nodo as T;
}

function esId(valor: string): valor is IdCalculadora {
  return valor === '1rm' || valor === 'proteina' || valor === 'calorias';
}

function idDesdeHash(): IdCalculadora {
  const hash = window.location.hash.replace('#', '');
  return esId(hash) ? hash : '1rm';
}

function limpiarError(id: string): void {
  const error = document.getElementById(id);
  const campo = document.querySelector<HTMLElement>(`[aria-describedby="${id}"]`);
  if (error) {
    error.hidden = true;
    error.textContent = '';
  }
  campo?.removeAttribute('aria-invalid');
}

function mostrarError(idError: string, campo: HTMLElement, mensaje: string): void {
  const error = tomar<HTMLParagraphElement>(idError);
  error.hidden = false;
  error.textContent = mensaje;
  campo.setAttribute('aria-invalid', 'true');
  campo.setAttribute('aria-describedby', idError);
}

function unidadActiva(): Unidad {
  const libra = tomar<HTMLButtonElement>('unidad-lb');
  return libra.getAttribute('aria-checked') === 'true' ? 'lb' : 'kg';
}

function limpiarEstados(): void {
  const compartir = document.getElementById('compartir-estado');
  const correo = document.getElementById('correo-estado');
  if (compartir) compartir.textContent = '';
  if (correo) correo.textContent = '';
}

function pintar(id: IdCalculadora): void {
  limpiarEstados();
  const vacio = tomar<HTMLParagraphElement>('resultado-vacio');
  const lleno = tomar<HTMLDivElement>('resultado-lleno');
  const acciones = tomar<HTMLDivElement>('acciones-resultado');
  const guardado = guardados.get(id);

  if (!guardado) {
    vacio.hidden = false;
    vacio.textContent = 'Pulsa Calcular. El resultado se queda en esta página.';
    lleno.hidden = true;
    acciones.hidden = true;
    return;
  }

  vacio.hidden = true;
  lleno.hidden = false;
  acciones.hidden = false;
  tomar('resultado-etiqueta').textContent = guardado.titulo;
  const cifra = tomar<HTMLSpanElement>('resultado-cifra');
  cifra.textContent = guardado.cifra;
  cifra.dataset.valor = guardado.valor;
  tomar('resultado-unidad').textContent = guardado.unidad;
  tomar('resultado-explicacion').textContent = guardado.explicacion;

  const rango = tomar('resultado-rango');
  rango.hidden = guardado.detalle.rango.length === 0;
  rango.textContent = guardado.detalle.rango;

  const nota = tomar('resultado-nota');
  nota.hidden = guardado.detalle.nota.length === 0;
  nota.textContent = guardado.detalle.nota;

  const parrafo = tomar('resultado-parrafo');
  parrafo.hidden = guardado.detalle.parrafo.length === 0;
  parrafo.textContent = guardado.detalle.parrafo;

  const aviso = tomar('resultado-aviso');
  aviso.hidden = guardado.detalle.aviso.length === 0;
  aviso.textContent = guardado.detalle.aviso;

  const referencia = tomar<HTMLDivElement>('resultado-referencia');
  referencia.replaceChildren();
  if (guardado.detalle.referencias.length > 0) {
    for (const linea of guardado.detalle.referencias) {
      const parrafo = document.createElement('p');
      parrafo.textContent = linea;
      referencia.append(parrafo);
    }
    referencia.hidden = false;
  } else {
    referencia.hidden = true;
  }

  const fuente = tomar<HTMLParagraphElement>('resultado-fuente');
  fuente.replaceChildren();
  if (guardado.detalle.fuenteTexto) {
    const enlace = document.createElement('a');
    enlace.href = guardado.detalle.fuenteUrl;
    enlace.rel = 'noopener noreferrer';
    enlace.target = '_blank';
    enlace.textContent = guardado.detalle.fuenteTexto;
    fuente.append(enlace);
    fuente.hidden = false;
  } else {
    fuente.hidden = true;
  }

  const tabla = tomar<HTMLTableElement>('resultado-tabla');
  tabla.replaceChildren();
  if (sitio.calculadoras.mostrarTablaCargas && guardado.detalle.cargas.length > 0) {
    const caption = document.createElement('caption');
    caption.textContent = '¿Cuánto cargar?';
    const thead = document.createElement('thead');
    const filaCabeza = document.createElement('tr');
    for (const titulo of ['Porcentaje', 'Peso']) {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = titulo;
      filaCabeza.append(th);
    }
    thead.append(filaCabeza);
    const tbody = document.createElement('tbody');
    for (const carga of guardado.detalle.cargas) {
      const fila = document.createElement('tr');
      const porcentaje = document.createElement('td');
      porcentaje.textContent = `${carga.porcentaje} %`;
      const peso = document.createElement('td');
      peso.textContent = `${formatearNumero(carga.peso)} ${carga.unidad}`;
      fila.append(porcentaje, peso);
      tbody.append(fila);
    }
    tabla.append(caption, thead, tbody);
    tabla.hidden = false;
  } else {
    tabla.hidden = true;
  }
}

function fallo(id: IdCalculadora, mensaje: string): void {
  limpiarEstados();
  guardados.delete(id);
  const vacio = tomar<HTMLParagraphElement>('resultado-vacio');
  vacio.hidden = false;
  vacio.textContent = mensaje;
  tomar('resultado-lleno').hidden = true;
  tomar('acciones-resultado').hidden = true;
  pintarSiguiente1rm(id, false);
}

function detalleVacio(): ResultadoGuardado['detalle'] {
  return {
    rango: '',
    nota: '',
    parrafo: '',
    fuenteTexto: '',
    fuenteUrl: '',
    aviso: '',
    referencias: [],
    cargas: [],
  };
}

function correr1rm(): boolean {
  limpiarError('error-peso-1rm');
  limpiarError('error-reps-1rm');
  const pesoCampo = tomar<HTMLInputElement>('peso-1rm');
  const repsCampo = tomar<HTMLInputElement>('reps-1rm');
  const peso = leerDecimal(pesoCampo.value);
  const reps = leerEntero(repsCampo.value);
  const unidad = unidadActiva();
  const ejercicio = tomar<HTMLSelectElement>('ejercicio-1rm').value as Ejercicio;

  if (peso === null) {
    const mensaje = 'Escribe el peso que levantaste.';
    mostrarError('error-peso-1rm', pesoCampo, mensaje);
    fallo('1rm', mensaje);
    pesoCampo.focus();
    return false;
  }
  if (reps === null) {
    const mensaje = 'Escribe las repeticiones completas.';
    mostrarError('error-reps-1rm', repsCampo, mensaje);
    fallo('1rm', mensaje);
    repsCampo.focus();
    return false;
  }

  const resultado = calcular1rm({
    peso,
    repeticiones: reps,
    unidad,
    ejercicio,
    porcentajes: sitio.calculadoras.porcentajesCargas,
  });

  if (!resultado.ok) {
    const esPeso = resultado.mensaje.includes('peso');
    mostrarError(
      esPeso ? 'error-peso-1rm' : 'error-reps-1rm',
      esPeso ? pesoCampo : repsCampo,
      resultado.mensaje,
    );
    fallo('1rm', resultado.mensaje);
    return false;
  }

  guardados.set('1rm', {
    calculadora: '1rm',
    titulo: resultado.titulo,
    cifra: formatearNumero(resultado.resultado),
    valor: String(resultado.resultado),
    unidad: resultado.unidad,
    explicacion: resultado.explicacion,
    detalle: {
      ...detalleVacio(),
      nota: resultado.nota,
      referencias: lineas1rm(resultado.epley, resultado.brzycki, resultado.resultado, resultado.unidad),
      cargas: resultado.cargas.map((carga) => ({ ...carga, unidad: resultado.unidad })),
    },
  });
  return true;
}

function correrProteina(): boolean {
  limpiarError('error-peso-proteina');
  limpiarError('error-objetivo-proteina');
  const pesoCampo = tomar<HTMLInputElement>('peso-proteina');
  const peso = leerDecimal(pesoCampo.value);
  const elegido = document.querySelector<HTMLInputElement>('input[name="objetivo-proteina"]:checked');

  if (peso === null) {
    const mensaje = 'Escribe tu peso corporal en kg.';
    mostrarError('error-peso-proteina', pesoCampo, mensaje);
    fallo('proteina', mensaje);
    pesoCampo.focus();
    return false;
  }
  if (!elegido) {
    const mensaje = 'Elige un objetivo.';
    const grupo = tomar<HTMLFieldSetElement>('grupo-objetivo');
    mostrarError('error-objetivo-proteina', grupo, mensaje);
    fallo('proteina', mensaje);
    return false;
  }

  const resultado = calcularProteina(peso, elegido.value as ObjetivoProteina, {
    minimo: sitio.calculadoras.proteina.minimo,
    maximo: sitio.calculadoras.proteina.maximo,
  });
  if (!resultado.ok) {
    mostrarError('error-peso-proteina', pesoCampo, resultado.mensaje);
    fallo('proteina', resultado.mensaje);
    return false;
  }

  guardados.set('proteina', {
    calculadora: 'proteina',
    titulo: resultado.titulo,
    cifra: formatearNumero(resultado.recomendado),
    valor: String(resultado.recomendado),
    unidad: 'g',
    explicacion: resultado.explicacion,
    detalle: {
      ...detalleVacio(),
      rango: resultado.rangoTexto,
      aviso: resultado.aviso,
      referencias: lineasProteina(
        sitio.calculadoras.proteina.minimo,
        sitio.calculadoras.proteina.maximo,
      ),
    },
  });
  return true;
}

function correrCalorias(): boolean {
  const campos = ['error-sexo', 'error-edad', 'error-peso-calorias', 'error-estatura', 'error-actividad'];
  for (const id of campos) limpiarError(id);

  const sexo = document.querySelector<HTMLInputElement>('input[name="sexo"]:checked');
  const edadCampo = tomar<HTMLInputElement>('edad');
  const pesoCampo = tomar<HTMLInputElement>('peso-calorias');
  const estaturaCampo = tomar<HTMLInputElement>('estatura');
  const actividadCampo = tomar<HTMLSelectElement>('actividad');
  const edad = leerEntero(edadCampo.value);
  const peso = leerDecimal(pesoCampo.value);
  const estatura = leerDecimal(estaturaCampo.value);

  if (!sexo) {
    const mensaje = 'Elige mujer u hombre.';
    mostrarError('error-sexo', tomar('grupo-sexo'), mensaje);
    fallo('calorias', mensaje);
    return false;
  }
  if (edad === null) {
    const mensaje = 'Escribe tu edad.';
    mostrarError('error-edad', edadCampo, mensaje);
    fallo('calorias', mensaje);
    edadCampo.focus();
    return false;
  }
  if (peso === null) {
    const mensaje = 'Escribe tu peso en kg.';
    mostrarError('error-peso-calorias', pesoCampo, mensaje);
    fallo('calorias', mensaje);
    pesoCampo.focus();
    return false;
  }
  if (estatura === null) {
    const mensaje = 'Escribe tu estatura en cm.';
    mostrarError('error-estatura', estaturaCampo, mensaje);
    fallo('calorias', mensaje);
    estaturaCampo.focus();
    return false;
  }
  if (!actividadCampo.value) {
    const mensaje = 'Elige qué tanto te mueves en la semana.';
    mostrarError('error-actividad', actividadCampo, mensaje);
    fallo('calorias', mensaje);
    actividadCampo.focus();
    return false;
  }

  const resultado = calcularCalorias({
    sexo: sexo.value as Sexo,
    edad,
    pesoKg: peso,
    estaturaCm: estatura,
    actividad: actividadCampo.value as Actividad,
  });
  if (!resultado.ok) {
    if (resultado.mensaje.includes('18') || resultado.mensaje.includes('edad')) {
      mostrarError('error-edad', edadCampo, resultado.mensaje);
      edadCampo.focus();
    } else if (resultado.mensaje.includes('estatura')) {
      mostrarError('error-estatura', estaturaCampo, resultado.mensaje);
      estaturaCampo.focus();
    } else if (resultado.mensaje.includes('mueves')) {
      mostrarError('error-actividad', actividadCampo, resultado.mensaje);
      actividadCampo.focus();
    } else {
      mostrarError('error-peso-calorias', pesoCampo, resultado.mensaje);
      pesoCampo.focus();
    }
    fallo('calorias', resultado.mensaje);
    return false;
  }

  guardados.set('calorias', {
    calculadora: 'calorias',
    titulo: resultado.titulo,
    cifra: formatearNumero(resultado.resultado),
    valor: String(resultado.resultado),
    unidad: 'kcal',
    explicacion: resultado.explicacion,
    detalle: {
      ...detalleVacio(),
      parrafo: resultado.parrafo,
      referencias: LINEAS_CALORIAS,
    },
  });
  return true;
}

function correr(id: IdCalculadora): boolean {
  if (id === '1rm') return correr1rm();
  if (id === 'proteina') return correrProteina();
  return correrCalorias();
}

function mostrarPestana(id: IdCalculadora, enfocar = false): void {
  activa = id;
  for (const candidato of IDS) {
    const tab = tomar<HTMLAnchorElement>(`tab-${candidato}`);
    const panel = tomar<HTMLElement>(`panel-${candidato}`);
    const encendida = candidato === id;
    tab.setAttribute('aria-selected', encendida ? 'true' : 'false');
    tab.tabIndex = encendida ? 0 : -1;
    panel.hidden = !encendida;
    if (encendida && enfocar) tab.focus();
  }
  pintar(id);
}

function resultadoActual(): ResultadoGuardado | null {
  return guardados.get(activa) ?? null;
}

function prepararCompartir(): void {
  const boton = tomar<HTMLButtonElement>('compartir');
  const estado = tomar<HTMLParagraphElement>('compartir-estado');
  boton.addEventListener('click', () => {
    const actual = resultadoActual();
    if (!actual) return;
    boton.disabled = true;
    estado.textContent = 'Preparando la imagen.';
    void compartirResultado(actual)
      .then((modo) => {
        medir('resultado_compartido', { calculadora: actual.calculadora });
        estado.textContent =
          modo === 'descargado' ? 'Se descargó la imagen.' : 'Listo, ya puedes compartirla.';
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          estado.textContent = '';
          return;
        }
        estado.textContent = 'No se pudo crear la imagen. Intenta de nuevo.';
      })
      .finally(() => {
        boton.disabled = false;
      });
  });
}

function alCambiar(id: IdCalculadora): void {
  if (!yaCalculado.has(id)) return;
  if (correr(id) && activa === id) pintar(id);
}

export function iniciarCalculadoras(): void {
  mostrarPestana(idDesdeHash());

  const lista = tomar<HTMLElement>('pestanas');
  lista.addEventListener('keydown', (evento) => {
    const indice = IDS.indexOf(activa);
    let siguiente = indice;
    if (evento.key === 'ArrowRight') siguiente = (indice + 1) % IDS.length;
    else if (evento.key === 'ArrowLeft') siguiente = (indice - 1 + IDS.length) % IDS.length;
    else if (evento.key === 'Home') siguiente = 0;
    else if (evento.key === 'End') siguiente = IDS.length - 1;
    else return;
    evento.preventDefault();
    const id = IDS[siguiente] ?? '1rm';
    history.replaceState(null, '', `#${id}`);
    mostrarPestana(id, true);
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (esId(hash)) mostrarPestana(hash);
  });

  for (const id of IDS) {
    const form = tomar<HTMLFormElement>(`form-${id}`);
    form.addEventListener('submit', (evento) => {
      evento.preventDefault();
      yaCalculado.add(id);
      if (correr(id)) {
        pintar(id);
        const actual = guardados.get(id);
        if (actual) medir('calculo_hecho', { calculadora: id, resultado: Number(actual.valor) });
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        tomar('resultado-vivo').scrollIntoView({
          behavior: reduce ? 'auto' : 'smooth',
          block: 'nearest',
        });
      }
    });
    form.addEventListener('input', () => alCambiar(id));
  }

  for (const boton of document.querySelectorAll<HTMLButtonElement>('[data-unidad]')) {
    boton.addEventListener('click', () => {
      for (const otro of document.querySelectorAll<HTMLButtonElement>('[data-unidad]')) {
        otro.setAttribute('aria-checked', otro === boton ? 'true' : 'false');
      }
      const etiqueta = tomar('etiqueta-peso-1rm');
      etiqueta.textContent = boton.dataset.unidad === 'lb' ? 'Peso levantado (lb)' : 'Peso levantado (kg)';
      alCambiar('1rm');
    });
  }

  prepararCompartir();
}
