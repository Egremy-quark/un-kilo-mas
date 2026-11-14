import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CONEXION_COBRO, puedeVerRegistro, tieneAcceso } from './acceso';
import { sitio } from '../../config/sitio';

describe('acceso', () => {
  it('abre la app igual para gratuito, coaching y paquete', () => {
    expect(tieneAcceso('ninguno')).toBe(false);
    expect(tieneAcceso('gratuito')).toBe(true);
    expect(tieneAcceso('coaching')).toBe(true);
    expect(tieneAcceso('paquete')).toBe(true);
  });

  it('un usuario no ve el registro de otro', () => {
    expect(puedeVerRegistro('aaa', 'aaa')).toBe(true);
    expect(puedeVerRegistro('aaa', 'bbb')).toBe(false);
  });

  it('deja el cobro como un update de tipo_acceso, sin precio', () => {
    expect(CONEXION_COBRO.campo).toBe('perfiles.tipo_acceso');
    expect(CONEXION_COBRO.valorAlPagar).toBe('paquete');
    expect(CONEXION_COBRO.nota).toContain('[POR DEFINIR]');
    expect(sitio.app.abiertaAlPublico).toBe(false);
  });
});

describe('RLS en la migración', () => {
  const sql = readFileSync('supabase/migrations/20261114180000_app_trackeo.sql', 'utf8');

  it('obliga a que entrenamientos, series y progreso pertenezcan a auth.uid()', () => {
    expect(sql).toContain('usuario_id = auth.uid()');
    expect(sql).toContain('policy entrenamientos_propios');
    expect(sql).toContain('policy series_de_entrenamiento_propio');
    expect(sql).toContain('policy progreso_propio');
    expect(sql).toContain('enable row level security');
    expect(sql).not.toMatch(/perfiles[\s\S]*for update[\s\S]*tipo_acceso/);
  });
});
