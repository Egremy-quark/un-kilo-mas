import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente de servidor. Usa la clave de servicio.
 * Nunca importar este archivo en scripts del navegador.
 */
export function supabaseServidor(): SupabaseClient {
  const url = import.meta.env.SUPABASE_URL;
  const clave = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) {
    throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, clave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
