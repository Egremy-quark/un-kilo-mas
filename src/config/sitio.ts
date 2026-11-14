export interface PreguntaFiltro {
  id: string;
  etiqueta: string;
  tipo: 'opciones' | 'texto';
  opciones?: string[];
}

export interface SeccionPrivacidad {
  id: string;
  titulo: string;
  texto: string;
}

export interface Sitio {
  nombre: string;
  dominio: string;
  instagramMarca: string;
  yohan: {
    instagram: string;
    certificado: string;
    /** Ruta pública cuando exista la foto. Si queda null, se usa src/assets/yohan.jpg en cuanto el archivo esté. */
    foto: string | null;
  };
  coaching: {
    cupo: string;
    precio: string;
    /** Número con código de país, solo dígitos. Mientras sea placeholder, WhatsApp queda desactivado. */
    whatsapp: string;
    incluye: {
      programas: string;
      mesociclos: string;
      nutricion: string;
      tecnica: string;
    };
    preguntasFiltro: PreguntaFiltro[];
  };
  calculadoras: {
    mostrarTablaCargas: boolean;
    porcentajesCargas: number[];
    mostrarObjetivosCalorias: boolean;
    proteina: {
      minimo: number;
      maximo: number;
      comidaMexicana: string;
    };
  };
  privacidad: {
    secciones: SeccionPrivacidad[];
  };
}

/** Único lugar para el nombre de trabajo y para todo lo que aún no está decidido. */
export const sitio: Sitio = {
  nombre: 'Un Kilo Más',
  dominio: '[POR DEFINIR]',
  instagramMarca: '[POR DEFINIR]',
  yohan: {
    instagram: 'yohantrainer',
    certificado: '[POR DEFINIR]',
    foto: null,
  },
  coaching: {
    cupo: '[POR DEFINIR]',
    precio: '[POR DEFINIR]',
    whatsapp: '[POR DEFINIR]',
    incluye: {
      programas: '[CONTENIDO POR YOHAN]',
      mesociclos: '[CONTENIDO POR YOHAN]',
      nutricion: '[CONTENIDO POR YOHAN]',
      tecnica: '[CONTENIDO POR YOHAN]',
    },
    preguntasFiltro: [
      {
        id: 'dias',
        etiqueta: '¿Cuántos días a la semana puedes entrenar?',
        tipo: 'opciones',
        opciones: ['2', '3', '4', '5 o más'],
      },
      {
        id: 'experiencia',
        etiqueta: '¿Cuál es tu experiencia entrenando?',
        tipo: 'opciones',
        opciones: ['Empiezo desde cero', 'Llevo unos meses', 'Llevo más de un año'],
      },
      {
        id: 'objetivo',
        etiqueta: '¿Qué quieres lograr?',
        tipo: 'texto',
      },
      {
        id: 'lesiones',
        etiqueta: '¿Tienes alguna lesión o molestia?',
        tipo: 'texto',
      },
      {
        id: 'ciudad',
        etiqueta: '¿En qué ciudad estás?',
        tipo: 'texto',
      },
    ],
  },
  calculadoras: {
    mostrarTablaCargas: true,
    porcentajesCargas: [70, 75, 80, 85],
    mostrarObjetivosCalorias: false,
    proteina: {
      minimo: 1.6,
      maximo: 2.2,
      comidaMexicana: '[CONTENIDO POR YOHAN]',
    },
  },
  privacidad: {
    secciones: [
      { id: 'responsable', titulo: 'Responsable', texto: '[POR DEFINIR]' },
      { id: 'datos', titulo: 'Datos que se recogen', texto: '[POR DEFINIR]' },
      { id: 'finalidades', titulo: 'Para qué se usan', texto: '[POR DEFINIR]' },
      { id: 'transferencias', titulo: 'Con quién se comparten', texto: '[POR DEFINIR]' },
      { id: 'arco', titulo: 'Derechos ARCO', texto: '[POR DEFINIR]' },
      { id: 'cambios', titulo: 'Cambios a este aviso', texto: '[POR DEFINIR]' },
    ],
  },
};
