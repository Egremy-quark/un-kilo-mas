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

export interface Testimonio {
  nombre: string;
  perfil: string;
  texto: string;
  tiempo: string;
  foto: string;
  autorizado: boolean;
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
    historia: {
      titulo: string;
      parrafos: string[];
      aprobadaPorYohan: boolean;
    };
  };
  correo: {
    activo: boolean;
  };
  nutricion: {
    activo: boolean;
  };
  mostrarHojaDeRuta: boolean;
  programa: {
    rutina02Nombre: string;
  };
  testimonios: Testimonio[];
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
  app: {
    /**
     * Si es false, el público no entra a /app.
     * Quien ya tiene cuenta con tipo_acceso distinto de ninguno puede iniciar sesión.
     */
    abiertaAlPublico: boolean;
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
    historia: {
      titulo: '¿Quién soy yo para enseñarte a entrenar?',
      aprobadaPorYohan: true,
      parrafos: [
        'Mi propia rata de laboratorio. Empecé a entrenar a los 15 años, en un pueblito donde no tenía quién me enseñara. Tuve que aprender por mi cuenta a entrenar y a alimentarme, mientras luchaba con mi tendencia a subir de peso.',
        'Después entré a estudiar una ingeniería que odiaba y me quitaba todo el día. Como tampoco veía los resultados que quería, decidí estudiar Entrenamiento Deportivo al mismo tiempo. ¡Fue una locura! Estudiaba dos carreras, entrenaba y aprendía muchísimo sobre lo que más me apasionaba. Pero, sobre todo, aprendí algo fundamental: cómo adaptar el entrenamiento a mi vida, y no mi vida al entrenamiento. Hoy, esa es una de las bases de mi trabajo.',
        'Al terminar ambas carreras me metí a estudiar Nutrición. En esa etapa me preparé a mí mismo y a otros atletas para competir en culturismo natural, sin dejar de lado nuestras vidas. Hoy me dedico a enseñar a entrenar y a alimentarse. Y aunque parezca que vivo en el gimnasio, ¡a mí nadie me paga por hacer mis entrenamientos! Así que sigo haciendo lo mismo que aprendí desde adolescente: organizar mi vida y la de mis atletas para que el entrenamiento sea algo que podamos mantener durante años, sin renunciar a todo lo demás.',
      ],
    },
  },
  /**
   * Mientras sea false, o el aviso de privacidad tenga [POR DEFINIR],
   * no se pide el correo. En México no se recogen correos sin aviso.
   */
  correo: {
    activo: false,
  },
  nutricion: {
    activo: false,
  },
  mostrarHojaDeRuta: false,
  programa: {
    rutina02Nombre: 'Aprender a moverse',
  },
  testimonios: [
    {
      nombre: 'Janeth',
      perfil: 'Madre de 6 hijos',
      texto: 'Entrena 3 veces por semana y es muy disciplinada con su alimentación.',
      tiempo: 'Llevamos 6 años entrenando juntos.',
      foto: 'janeth.jpg',
      autorizado: true,
    },
    {
      nombre: 'Erick',
      perfil: 'Contador',
      texto: 'Contador por la tarde, atleta por la noche.',
      tiempo: 'Llevamos 5 años entrenando juntos.',
      foto: 'erick.jpg',
      autorizado: true,
    },
    {
      nombre: 'Jimena',
      perfil: 'Maestra de tiempo completo',
      texto: 'Entrena 3 veces por semana, 4 en vacaciones.',
      tiempo: 'Su cambio, en menos de un año.',
      foto: 'jimena.jpg',
      autorizado: true,
    },
    {
      nombre: 'Deisy',
      perfil: 'Mamá y cosmetóloga',
      texto: 'Va al gym 4 veces por semana.',
      tiempo: 'Llevamos 5 años entrenando juntos.',
      foto: 'deisy.jpg',
      autorizado: true,
    },
    {
      nombre: 'Luz',
      perfil: 'Trabaja sentada en un consultorio todo el día',
      texto: 'Muy temprano, 3 veces por semana, se vuelve una diosa de las pesas.',
      tiempo: 'Llevamos 4 años entrenando juntos.',
      foto: 'luz.jpg',
      autorizado: true,
    },
    {
      nombre: 'César',
      perfil: 'Profesor de primaria',
      texto: 'Por la tarde, 4 veces por semana, se convierte en un monstruo de las pesas.',
      tiempo: 'Llevamos 5 años entrenando juntos.',
      foto: 'cesar.jpg',
      autorizado: true,
    },
  ],
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
  app: {
    abiertaAlPublico: false,
  },
};

export function avisoPrivacidadListo(): boolean {
  return !sitio.privacidad.secciones.some((seccion) => seccion.texto.includes('[POR DEFINIR]'));
}

/** El formulario de correo solo se muestra con interruptor y aviso de privacidad listos. */
export function capturaCorreoVisible(): boolean {
  return sitio.correo.activo && avisoPrivacidadListo();
}

export function testimoniosAutorizados(): Testimonio[] {
  return sitio.testimonios.filter((item) => item.autorizado);
}
