import { afterEach, describe, expect, it, vi } from 'vitest';
import { capturaCorreoVisible, sitio } from '../config/sitio';
import {
  correoValido,
  crearCuentaPrueba,
  guardarLeadCalculadora,
  MENSAJE_AVISO,
  MENSAJE_CORREO,
  MENSAJE_ERROR,
  MENSAJE_EXITO,
  MENSAJE_LIMITE,
} from './cuenta';

const { otp, insert } = vi.hoisted(() => ({
  otp: vi.fn(),
  insert: vi.fn(),
}));

vi.mock('./supabase-cliente', () => ({
  supabaseNavegadorListo: () => true,
  supabaseNavegador: () => ({
    auth: { signInWithOtp: otp },
    from: () => ({ insert }),
  }),
}));

describe('cuenta de prueba', () => {
  afterEach(() => {
    otp.mockReset();
    insert.mockReset();
  });

  it('rechaza un correo inválido sin llamar a Supabase', async () => {
    const resultado = await crearCuentaPrueba({
      correo: 'no-es-correo',
      aviso: true,
      trampa: '',
    });
    expect(correoValido('no-es-correo')).toBe(false);
    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toBe(MENSAJE_CORREO);
    expect(otp).not.toHaveBeenCalled();
  });

  it('pide el aviso de privacidad', async () => {
    const resultado = await crearCuentaPrueba({
      correo: 'ana@correo.com',
      aviso: false,
      trampa: '',
    });
    expect(resultado.mensaje).toBe(MENSAJE_AVISO);
    expect(otp).not.toHaveBeenCalled();
  });

  it('si la trampa viene llena, finge éxito y no envía', async () => {
    const resultado = await crearCuentaPrueba({
      correo: 'ana@correo.com',
      aviso: true,
      trampa: 'bot',
    });
    expect(resultado).toEqual({ ok: true, mensaje: MENSAJE_EXITO });
    expect(otp).not.toHaveBeenCalled();
  });

  it('manda el enlace mágico sin rol ni plan', async () => {
    otp.mockResolvedValue({ error: null });
    const resultado = await crearCuentaPrueba({
      correo: 'ana@correo.com',
      aviso: true,
      trampa: '',
    });
    expect(resultado).toEqual({ ok: true, mensaje: MENSAJE_EXITO });
    expect(otp).toHaveBeenCalledTimes(1);
    const argumento = otp.mock.calls[0]?.[0] as {
      email: string;
      options: { emailRedirectTo: string; data: Record<string, unknown>; captchaToken?: string };
    };
    expect(argumento.email).toBe('ana@correo.com');
    expect(argumento.options.data.acepta_aviso).toBe(true);
    expect(argumento.options.data).not.toHaveProperty('rol');
    expect(argumento.options.data).not.toHaveProperty('plan');
    expect(argumento.options.captchaToken).toBeUndefined();
  });

  it('traduce el límite de envíos y el resto de errores', async () => {
    otp.mockResolvedValue({ error: { status: 429, message: 'rate' } });
    expect((await crearCuentaPrueba({ correo: 'ana@correo.com', aviso: true, trampa: '' })).mensaje).toBe(
      MENSAJE_LIMITE,
    );
    otp.mockResolvedValue({ error: { status: 500, message: 'boom' } });
    expect((await crearCuentaPrueba({ correo: 'ana@correo.com', aviso: true, trampa: '' })).mensaje).toBe(
      MENSAJE_ERROR,
    );
  });

  it('inserta el lead de una calculadora sin .select()', async () => {
    insert.mockResolvedValue({ error: null });
    const resultado = await guardarLeadCalculadora('ana@correo.com', '1rm');
    expect(resultado.ok).toBe(true);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ correo: 'ana@correo.com', origen: 'calculadora-1rm' }),
    );
    expect(insert.mock.results[0]?.value).not.toHaveProperty('select');
  });
});

describe('interruptores', () => {
  it('deja el formulario y el captcha apagados hasta que falte nada pendiente', () => {
    expect(sitio.correo.activo).toBe(false);
    expect(sitio.captcha.activo).toBe(false);
    expect(sitio.urlPlataforma).toContain('[POR DEFINIR]');
    expect(capturaCorreoVisible()).toBe(false);
  });
});
