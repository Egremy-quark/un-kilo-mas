import type { TipoAcceso } from './tipos';

/** Misma app para cualquier tipo de acceso. El tipo solo abre o cierra la puerta. */
export function tieneAcceso(tipo: TipoAcceso | null | undefined): boolean {
  return tipo === 'gratuito' || tipo === 'coaching' || tipo === 'paquete';
}

/**
 * Cuando exista un proveedor de pagos, el webhook solo debe hacer:
 *   update perfiles set tipo_acceso = 'paquete' where id = <usuario>
 * No hace falta otra tabla ni otra pantalla. El cobro no vive en esta base.
 */
export const CONEXION_COBRO = {
  campo: 'perfiles.tipo_acceso',
  valorAlPagar: 'paquete',
  valorSinPagar: 'ninguno',
  nota: '[POR DEFINIR] proveedor, precio y fecha de apertura',
} as const;

export function puedeVerRegistro(duenoId: string, usuarioActualId: string): boolean {
  return duenoId === usuarioActualId;
}
