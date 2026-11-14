export function esPendiente(valor: string | null | undefined): boolean {
  if (!valor) return false;
  return valor.includes('[POR DEFINIR]') || valor.includes('[CONTENIDO POR YOHAN]');
}

export function clasePendiente(valor: string): string {
  return esPendiente(valor) ? 'marca-pendiente' : '';
}
