/**
 * PLACEHOLDER DE DISEÑO. No son testimonios reales.
 * Nunca deben presentarse como prueba social ni como casos de clientes.
 * Antes de difundir la página: sustituye este arreglo por testimonios reales
 * con permiso, o quita la sección completa.
 * Para quitarla: borra <CarruselEjemplo /> en src/pages/index.astro.
 * Para sustituirlos: cambia solo este archivo.
 */

export interface TestimonioEjemplo {
  id: string;
  iniciales: string;
  frase: string;
  texto: string;
}

export const TESTIMONIOS_EJEMPLO: TestimonioEjemplo[] = [
  {
    id: 'ejemplo-1',
    iniciales: 'A. R.',
    frase: 'Un plan claro',
    texto: 'Texto de ejemplo para ver cómo se lee una tarjeta corta.',
  },
  {
    id: 'ejemplo-2',
    iniciales: 'M. L.',
    frase: 'De a poco',
    texto: 'Texto de ejemplo. Aquí iría una frase genérica, sin cifras.',
  },
  {
    id: 'ejemplo-3',
    iniciales: 'C. S.',
    frase: 'Con estructura',
    texto: 'Texto de ejemplo para revisar el diseño del carrusel.',
  },
];
