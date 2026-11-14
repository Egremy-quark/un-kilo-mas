/**
 * Programa para principiantes de Yohan. Ya existe: no es un producto nuevo.
 * Los detalles técnicos, el video y los casos de antes y después no se publican
 * hasta que Yohan los cierre. Si el valor es un marcador, la página no lo muestra.
 */

export interface FasePrograma {
  id: '01' | '02';
  nombre: string;
  titulo: string;
  donde: string;
  texto: string;
}

export const FASES_PROGRAMA: FasePrograma[] = [
  {
    id: '01',
    nombre: 'Rutina 01',
    titulo: 'Base articular',
    donde: 'En casa, sin equipo',
    texto:
      'Para empezar en casa, sin experiencia previa. Movilidad y estabilidad general, para preparar las articulaciones antes de cargar peso.',
  },
  {
    id: '02',
    nombre: 'Rutina 02',
    titulo: 'Aprender a moverse',
    donde: 'En el gimnasio',
    texto:
      'Ya en el gimnasio. Aprender los movimientos básicos para empezar a ganar fuerza y técnica, con video de cada ejercicio y cómo progresar las cargas.',
  },
];

/** Pasos de la entrega en la web. No es un PDF ni un enlace de Drive. */
export const PASOS_RUTINA_01 = [
  { numero: '1', titulo: 'Ábrela' },
  { numero: '2', titulo: 'Revísala completa' },
  { numero: '3', titulo: 'Sigue la secuencia' },
] as const;

/**
 * [CONTENIDO POR YOHAN] URL del tutorial en video de la Rutina 01.
 * Vacío a propósito: no se incrusta nada hasta que Yohan entregue su video.
 * No usar videos de stock ni tutoriales de terceros.
 */
export const TUTORIAL_RUTINA_01 = '';

/**
 * [CONTENIDO POR YOHAN] Ejercicios, series, cargas y duración de cada fase.
 * No renderizar este texto al visitante.
 */
export const DETALLE_RUTINAS = '[CONTENIDO POR YOHAN]';

/**
 * [POR DEFINIR] Antes y después del PDF.
 * No publicar como prueba ni como testimonio hasta que Yohan confirme cada caso y su permiso.
 * No renderizar.
 */
export const ANTES_DESPUES = '[POR DEFINIR]';

/**
 * [POR DEFINIR] Precio del programa, del Pack de Rutinas, del programa de abdomen y del coaching.
 * No tomar precios del PDF ni de Gumroad. No mostrar al visitante.
 */
export const PRECIO_PROGRAMA = '[POR DEFINIR]';
