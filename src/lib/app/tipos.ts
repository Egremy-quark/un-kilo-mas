export const TIPOS_ACCESO = ['ninguno', 'gratuito', 'coaching', 'paquete'] as const;
export type TipoAcceso = (typeof TIPOS_ACCESO)[number];

export interface Perfil {
  id: string;
  correo: string | null;
  tipo_acceso: TipoAcceso;
}

export interface Bloque {
  id: string;
  clave: string;
  nombre: string;
  descripcion: string;
  orden: number;
  publicado: boolean;
  es_prueba: boolean;
}

export interface SesionBloque {
  id: string;
  bloque_id: string;
  posicion: number;
  objetivo: string;
}

export interface EjercicioSesion {
  id: string;
  sesion_id: string;
  ejercicio: string;
  orden: number;
  series_previstas: number;
  repeticiones_previstas: number;
  nota_tecnica: string;
}

export interface Entrenamiento {
  id: string;
  usuario_id: string;
  bloque_id: string | null;
  sesion_id: string | null;
  estado: 'abierta' | 'cerrada';
  iniciado_en: string;
  cerrado_en: string | null;
}

export interface SerieRegistrada {
  id: string;
  entrenamiento_id: string;
  ejercicio: string;
  numero_serie: number;
  peso_kg: number;
  repeticiones: number;
  completada: boolean;
}

export interface ProgresoBloque {
  usuario_id: string;
  bloque_id: string;
  sesion_id: string | null;
  estado: 'en_curso' | 'terminado';
}

export interface BloqueArchivo {
  clave: string;
  nombre: string;
  descripcion: string;
  orden: number;
  publicado: boolean;
  es_prueba: boolean;
  sesiones: {
    posicion: number;
    objetivo: string;
    ejercicios: {
      ejercicio: string;
      orden: number;
      series_previstas: number;
      repeticiones_previstas: number;
      nota_tecnica: string;
    }[];
  }[];
}
