import 'reflect-metadata';
import { scryptSync } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../dist/auth/auth.service.js';
import { AuthRepository } from '../dist/auth/auth.repository.js';
import { duracionJwtEnMinutos } from '../dist/auth/duracion-jwt.js';

describe('Duraciones JWT configurables', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it.each([
    [undefined, 30],
    ['480', 480],
    ['15s', 0.25],
    [' 15 S ', 0.25],
    ['0.25', 0.25],
    ['.25', 0.25],
    ['30m', 30],
    ['8h', 480],
    ['1s', 1 / 60],
  ])('interpreta %s como %s minutos', (valor, minutos) => {
    expect(duracionJwtEnMinutos('JWT_SESSION_MINUTES', valor, 30)).toBe(
      minutos,
    );
  });

  it.each([
    '',
    ' ',
    '0',
    '-1',
    'texto',
    'NaN',
    'Infinity',
    '15ms',
    '0.5s',
    '999999999999999999h',
  ])('rechaza una duración inválida: %s', (valor) => {
    expect(() =>
      duracionJwtEnMinutos('JWT_SESSION_MINUTES', valor, 30),
    ).toThrow('JWT_SESSION_MINUTES: duración inválida');
  });

  it('inicia sesión con 15s y firma fechas coherentes para JWT y PostgreSQL', async () => {
    vi.stubEnv('JWT_LOGIN_MINUTES', '8h');
    vi.stubEnv('JWT_SESSION_MINUTES', '15s');
    const now = Math.floor(Date.now() / 1000) * 1000;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const repository = Object.create(
      AuthRepository.prototype,
    ) as AuthRepository;
    vi.spyOn(repository, 'buscarUsuario').mockResolvedValue({
      id: 1,
      usuario: 'prueba',
      nombre: 'Prueba',
      activo: true,
      password_hash: `sal-prueba:${scryptSync('password-prueba', 'sal-prueba', 64).toString('hex')}`,
    });
    const crearSesion = vi
      .spyOn(repository, 'crearSesion')
      .mockResolvedValue({ exito: true });
    const service = new AuthService(new JwtService(), repository);
    const { data } = await service.login({
      usuario: 'prueba',
      password: 'password-prueba',
    });
    const access = await service.verificarToken(data.accessToken);
    const login = await service.verificarToken(data.refreshToken);

    expect(data.sessionExpiraEnMinutos).toBe(0.25);
    expect(data.loginExpiraEnMinutos).toBe(480);
    expect(access.exp).toBe(now / 1000 + 15);
    expect(login.exp).toBe(now / 1000 + 8 * 3600);
    expect(crearSesion).toHaveBeenCalledWith(
      expect.objectContaining({
        expiracionSesion: new Date(access.exp * 1000),
        expiracionLogin: new Date(login.exp * 1000),
      }),
    );
  });

  it.each(['JWT_LOGIN_MINUTES', 'JWT_SESSION_MINUTES'])(
    'detecta %s inválido al iniciar el servicio',
    (nombre) => {
      vi.stubEnv('JWT_LOGIN_MINUTES', '480');
      vi.stubEnv('JWT_SESSION_MINUTES', '30');
      vi.stubEnv(nombre, 'incorrecto');
      expect(
        () =>
          new AuthService(
            new JwtService(),
            Object.create(AuthRepository.prototype),
          ),
      ).toThrow(`${nombre}: duración inválida`);
    },
  );
});
