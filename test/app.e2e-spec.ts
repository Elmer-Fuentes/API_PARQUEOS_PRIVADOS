import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { AppModule } from '../dist/app.module.js';
import { configurarApp } from '../dist/app.setup.js';
import { DatabaseService } from '../dist/database/database.service.js';
import { AuthRepository } from '../dist/auth/auth.repository.js';

const recursos: { resource: string; body: Record<string, unknown> }[] =
  JSON.parse(
    readFileSync(new URL('./fixtures/recursos.json', import.meta.url), 'utf8'),
  );

describe('API HTTP con PostgreSQL simulado', () => {
  let app: INestApplication;
  let baseUrl: string;
  let token: string;
  let jwt: JwtService;
  const payload = {
    sub: 1,
    usuario: 'prueba',
    nombre: 'Prueba HTTP',
    tipo: 'session',
    sesionId: randomUUID(),
    jti: randomUUID(),
  };
  const auth = {
    validarSesion: vi.fn(),
    mantenerSesion: vi.fn(),
    validarLogin: vi.fn(),
  };
  const db = { query: vi.fn(), probarConexion: vi.fn() };
  const ok = { exito: true, mensaje: 'OK', data: { id: 1 } };

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(DatabaseService)
      .useValue(db)
      .overrideProvider(AuthRepository)
      .useValue(auth)
      .compile();
    app = module.createNestApplication({ logger: false });
    configurarApp(app);
    await app.listen(0, '127.0.0.1');
    baseUrl = await app.getUrl();
    jwt = app.get(JwtService);
    token = await firmarToken();
  });
  afterAll(async () => {
    await app?.close();
  });
  beforeEach(() => {
    db.query.mockReset().mockResolvedValue({ rows: [{ resultado: ok }] });
    db.probarConexion.mockReset().mockResolvedValue(ok);
    auth.validarSesion.mockReset().mockResolvedValue(true);
    auth.mantenerSesion.mockReset().mockResolvedValue(null);
    auth.validarLogin.mockReset().mockResolvedValue(true);
  });

  function firmarToken(
    data: Record<string, unknown> = payload,
    expiresIn = 60,
  ) {
    return jwt.signAsync(data, {
      secret: process.env.JWT_SECRET || 'CAMBIAR_ESTE_SECRETO_EN_PRODUCCION',
      expiresIn,
    });
  }

  async function request(path: string, method = 'GET', body?: object) {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    if (body !== undefined) options.body = JSON.stringify(body);
    return fetch(`${baseUrl}/api${path}`, options);
  }

  it('inicia y expone el estado de la API', async () => {
    const response = await request('');
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ exito: true });
  });
  it('consulta la conexion de la base de datos', async () => {
    expect(await (await request('/health')).json()).toEqual(ok);
    expect(db.probarConexion).toHaveBeenCalledOnce();
  });

  it('rechaza solicitudes sin JWT antes de consultar SQL', async () => {
    const response = await fetch(`${baseUrl}/api/vehiculos/consultar`);
    expect(response.status).toBe(401);
    expect(auth.validarSesion).not.toHaveBeenCalled();
    expect(db.query).not.toHaveBeenCalled();
  });

  it('rechaza firmas alteradas aunque el accessToken esté vencido', async () => {
    for (const original of [token, await firmarToken(payload, -1)]) {
      const [header, body, signature] = original.split('.');
      const invalid = `${header}.${body}.${signature[0] === 'a' ? 'b' : 'a'}${signature.slice(1)}`;
      const response = await fetch(`${baseUrl}/api/vehiculos/consultar`, {
        headers: { Authorization: `Bearer ${invalid}` },
      });
      expect(response.status).toBe(401);
    }
    expect(auth.validarSesion).not.toHaveBeenCalled();
    expect(db.query).not.toHaveBeenCalled();
  });

  it('acepta el mismo accessToken vencido mientras SQL confirme el login activo', async () => {
    const vencido = await firmarToken(payload, -1);
    for (let intento = 0; intento < 2; intento++) {
      const response = await fetch(`${baseUrl}/api/vehiculos/consultar`, {
        headers: { Authorization: `Bearer ${vencido}` },
      });
      expect(response.status).toBe(200);
    }
    expect(auth.validarSesion).toHaveBeenCalledTimes(2);
    expect(auth.mantenerSesion).not.toHaveBeenCalled();
  });

  it('amplía una sesión vencida sin cambiar el identificador del accessToken', async () => {
    auth.validarSesion.mockResolvedValue(false);
    auth.mantenerSesion.mockResolvedValue({ sesionId: payload.sesionId });
    const vencido = await firmarToken(payload, -1);
    const response = await fetch(`${baseUrl}/api/vehiculos/consultar`, {
      headers: { Authorization: `Bearer ${vencido}` },
    });
    expect(response.status).toBe(200);
    expect(auth.mantenerSesion).toHaveBeenCalledWith(
      payload.sesionId,
      payload.sub,
      payload.jti,
      'session',
      expect.any(Date),
    );
  });

  it('rechaza accessToken vencido si el login ya no está disponible', async () => {
    auth.validarSesion.mockResolvedValue(false);
    const response = await fetch(`${baseUrl}/api/vehiculos/consultar`, {
      headers: { Authorization: `Bearer ${await firmarToken(payload, -1)}` },
    });
    expect(response.status).toBe(401);
    expect(auth.mantenerSesion).toHaveBeenCalledOnce();
    expect(db.query).not.toHaveBeenCalled();
  });

  it('el loginToken vencido no puede renovar ni cerrar sesión', async () => {
    const vencido = await firmarToken({ ...payload, tipo: 'login' }, -1);
    for (const operation of ['renovar-sesion', 'logout']) {
      const response = await fetch(`${baseUrl}/api/auth/${operation}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${vencido}` },
      });
      expect(response.status).toBe(401);
    }
    expect(auth.validarLogin).not.toHaveBeenCalled();
    expect(auth.mantenerSesion).not.toHaveBeenCalled();
  });

  it('renovar devuelve la vigencia sin emitir nuevos tokens', async () => {
    const vigencia = {
      sesionId: payload.sesionId,
      sessionExpiraEn: new Date(Date.now() + 60_000).toISOString(),
      loginExpiraEn: new Date(Date.now() + 120_000).toISOString(),
    };
    auth.mantenerSesion.mockResolvedValue(vigencia);
    const loginToken = await firmarToken({ ...payload, tipo: 'login' });
    const response = await fetch(`${baseUrl}/api/auth/renovar-sesion`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${loginToken}` },
    });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      exito: true,
      mensaje: expect.any(String),
      data: vigencia,
    });
    expect(auth.mantenerSesion).toHaveBeenCalledWith(
      payload.sesionId,
      payload.sub,
      payload.jti,
      'login',
      expect.any(Date),
    );
  });

  it('rechaza tokens sin exp, sin JTI válido o todavía no vigentes', async () => {
    const secret =
      process.env.JWT_SECRET || 'CAMBIAR_ESTE_SECRETO_EN_PRODUCCION';
    const invalidos = [
      await jwt.signAsync(payload, { secret }),
      await firmarToken({ ...payload, jti: 'invalido' }),
      await jwt.signAsync(payload, { secret, expiresIn: 60, notBefore: 30 }),
    ];
    for (const invalid of invalidos) {
      const response = await fetch(`${baseUrl}/api/vehiculos/consultar`, {
        headers: { Authorization: `Bearer ${invalid}` },
      });
      expect(response.status).toBe(401);
    }
    expect(auth.validarSesion).not.toHaveBeenCalled();
    expect(auth.mantenerSesion).not.toHaveBeenCalled();
  });

  it('explica que un loginToken no sirve para consultar recursos', async () => {
    const loginToken = await firmarToken({ ...payload, tipo: 'login' });
    const response = await fetch(`${baseUrl}/api/vehiculos/consultar`, {
      headers: { Authorization: `Bearer ${loginToken}` },
    });
    expect(response.status).toBe(401);
    expect((await response.json()).message).toContain('accessToken');
    expect(auth.validarSesion).not.toHaveBeenCalled();
    expect(db.query).not.toHaveBeenCalled();
  });

  it('consulta la sesion y rechaza un JWT firmado si fue revocado', async () => {
    auth.validarSesion.mockResolvedValue(false);
    expect((await request('/vehiculos/consultar')).status).toBe(401);
    expect(auth.validarSesion).toHaveBeenCalledWith(
      payload.sesionId,
      payload.sub,
      payload.jti,
    );
    expect(db.query).not.toHaveBeenCalled();
  });

  describe.each(recursos)('$resource', ({ resource, body }) => {
    const tabla = resource.replaceAll('-', '_');
    it('consulta registros', async () => {
      expect(await (await request(`/${resource}/consultar`)).json()).toEqual(
        ok,
      );
      expect(db.query).toHaveBeenCalledWith(
        `SELECT sp_${tabla}_consultar() AS resultado`,
      );
    });
    it('busca por ID', async () => {
      expect(await (await request(`/${resource}/buscar/1`)).json()).toEqual(ok);
      expect(db.query).toHaveBeenCalledWith(
        `SELECT sp_${tabla}_buscar($1) AS resultado`,
        [1],
      );
    });
    it('agrega con los datos de Postman y filtra propiedades ajenas', async () => {
      const response = await request(`/${resource}/agregar`, 'POST', {
        ...body,
        ajeno: 'ignorar',
      });
      expect(response.status).toBe(201);
      expect(await response.json()).toEqual(ok);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining(`sp_${tabla}_agregar(`),
        Object.values(body),
      );
    });
    it('edita un campo conservando todos los demas', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ resultado: { ...ok, data: { id: 1, ...body } } }],
      });
      const [field, value] = Object.entries(body)[0];
      const changed = typeof value === 'number' ? 2 : 'Actualizado';
      const response = await request(`/${resource}/editar/1`, 'PUT', {
        [field]: changed,
      });
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(ok);
      expect(db.query).toHaveBeenLastCalledWith(
        expect.stringContaining(`sp_${tabla}_editar(`),
        [1, ...Object.values({ ...body, [field]: changed })],
      );
    });
    it('no edita un registro inexistente', async () => {
      const missing = {
        exito: false,
        mensaje: 'Registro inexistente.',
        data: null,
      };
      db.query.mockResolvedValueOnce({ rows: [{ resultado: missing }] });
      expect(
        await (await request(`/${resource}/editar/1`, 'PUT', {})).json(),
      ).toEqual(missing);
      expect(db.query).toHaveBeenCalledOnce();
    });
    it('elimina por ID', async () => {
      expect(
        await (await request(`/${resource}/eliminar/1`, 'DELETE')).json(),
      ).toEqual(ok);
      expect(db.query).toHaveBeenCalledWith(
        `SELECT sp_${tabla}_eliminar($1) AS resultado`,
        [1],
      );
    });
    it('rechaza datos obligatorios ausentes antes de consultar SQL', async () => {
      expect((await request(`/${resource}/agregar`, 'POST', {})).status).toBe(
        400,
      );
      expect(db.query).not.toHaveBeenCalled();
    });
    it('rechaza un ID que no sea entero', async () => {
      expect((await request(`/${resource}/buscar/abc`)).status).toBe(400);
      expect(db.query).not.toHaveBeenCalled();
    });
  });
});
