export type EventoMedicion =
  | 'calculo_hecho'
  | 'resultado_compartido'
  | 'correo_enviado'
  | 'filtro_completado'
  | 'whatsapp_abierto';

/**
 * Medición. El proveedor está [POR DEFINIR] (conviene uno sin cookies, como Plausible o Umami).
 * Por ahora solo escribe en la consola. No hay cookies de terceros ni banner.
 */
export function medir(
  evento: EventoMedicion,
  datos: Record<string, string | number | boolean> = {},
): void {
  console.info('[medir]', evento, datos);
}
