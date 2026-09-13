import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID, scryptSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import pg from 'pg';
import { AppModule } from '../dist/app.module.js';
import { configurarApp } from '../dist/app.setup.js';
import { DatabaseService } from '../dist/database/database.service.js';

const client = new pg.Client({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'parqueo_privados_gt',
  connectionTimeoutMillis: 5000,
});
const fixtures = JSON.parse(
  readFileSync(
    new URL('../test/fixtures/recursos.json', import.meta.url),
    'utf8',
  ),
);
const referencias = {
  sede_id: 'sedes',
  cliente_id: 'clientes',
  tipo_vehiculo_id: 'tipos-vehiculos',
  vehiculo_id: 'vehiculos',
  espacio_id: 'espacios',
  empleado_id: 'empleados',
  entrada_id: 'entradas',
  salida_id: 'salidas',
};
const schema = `prueba_backend_${randomUUID().replaceAll('-', '')}`;
const registros = new Map();
let app;
let transactionStarted = false;
let operations = 0;
let authChecks = 0;

try {
  await client.connect();
  await client.query('BEGIN');
  transactionStarted = true;
  // El nombre se genera internamente; nunca se interpola entrada del usuario.
  await client.query(`CREATE SCHEMA "${schema}"`);
  await client.query(`SET LOCAL search_path TO "${schema}"`);
  await client.query(
    readFileSync(
      new URL('../../Database/01_Tablas_Parqueo.sql', import.meta.url),
      'utf8',
    ),
  );
  await client.query(
    readFileSync(
      new URL('../../Database/03_Stored_Procedures_CRUD.sql', import.meta.url),
      'utf8',
    ),
  );

  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(DatabaseService)
    .useValue({ query: (sql, params) => client.query(sql, params) })
    .compile();
  app = module.createNestApplication({ logger: false });
  configurarApp(app);
  await app.listen(0, '127.0.0.1');
  const baseUrl = await app.getUrl();
  const jwt = app.get(JwtService);
  const secret = process.env.JWT_SECRET || 'CAMBIAR_ESTE_SECRETO_EN_PRODUCCION';

  const usuario = `prueba_${randomUUID()}`;
  const password = randomUUID();
  const salt = randomUUID();
  await client.query(
    'INSERT INTO usuarios_sistema(usuario,nombre,password_hash) VALUES($1,$2,$3)',
    [
      usuario,
      'Prueba de autenticación',
      `${salt}:${scryptSync(password, salt, 64).toString('hex')}`,
    ],
  );

  async function authRequest(
    path,
    { method = 'GET', token, body, status = 200 } = {},
  ) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${baseUrl}/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const result = await response.json();
    assert.equal(response.status, status, `${path}: ${JSON.stringify(result)}`);
    authChecks++;
    return result;
  }

  async function estadoSesion(sesionId) {
    const { rows } = await client.query(
      `SELECT session_jti, activa,
        EXTRACT(EPOCH FROM (fecha_expiracion_sesion AT TIME ZONE current_setting('TimeZone'))) AS exp,
        EXTRACT(EPOCH FROM (fecha_expiracion_login AT TIME ZONE current_setting('TimeZone'))) AS login_exp
       FROM sesiones_usuario WHERE sesion_id=$1`,
      [sesionId],
    );
    return rows[0];
  }

  async function vencerPlazoSesion(sesionId) {
    await client.query(
      "UPDATE sesiones_usuario SET fecha_expiracion_sesion=CURRENT_TIMESTAMP - INTERVAL '1 minute' WHERE sesion_id=$1",
      [sesionId],
    );
  }

  // El proceso Node conserva su zona local; PostgreSQL cambia de zona para
  // detectar pérdidas del desplazamiento al recibir parámetros TIMESTAMP.
  for (const zone of ['UTC', 'America/Guatemala', 'Asia/Tokyo']) {
    await client.query("SELECT set_config('TimeZone', $1, true)", [zone]);
    const login = await authRequest('/auth/login', {
      method: 'POST',
      body: { usuario, password },
      status: 201,
    });
    const { accessToken, refreshToken } = login.data;
    await authRequest('/vehiculos/consultar', { token: accessToken });

    const payload = JSON.parse(
      Buffer.from(accessToken.split('.')[1], 'base64url'),
    );
    const initial = await estadoSesion(payload.sesionId);
    assert.equal(
      Number(initial.exp),
      payload.exp,
      `Vencimiento JWT/SQL diferente en ${zone}`,
    );
    assert.equal(Number(initial.login_exp), jwt.decode(refreshToken).exp);

    await authRequest('/vehiculos/consultar', {
      token: refreshToken,
      status: 401,
    });
    await authRequest('/auth/renovar-sesion', {
      method: 'POST',
      token: accessToken,
      status: 401,
    });
    const checked = await authRequest('/auth/renovar-sesion', {
      method: 'POST',
      token: refreshToken,
      status: 201,
    });
    assert.equal('accessToken' in checked.data, false);
    assert.equal('refreshToken' in checked.data, false);
    assert.deepEqual(
      await estadoSesion(payload.sesionId),
      initial,
      'Consultar una sesión vigente no cambia su plazo ni su JTI',
    );

    // La petición normal renueva el plazo SQL usando exactamente el mismo JWT.
    await vencerPlazoSesion(payload.sesionId);
    await authRequest('/vehiculos/consultar', {
      token: accessToken,
    });
    const automatic = await estadoSesion(payload.sesionId);
    assert.equal(automatic.session_jti, initial.session_jti);
    assert.ok(Number(automatic.exp) > Date.now() / 1000);
    assert.ok(Number(automatic.exp) <= Number(automatic.login_exp));

    // Simula el exp inicial ya transcurrido, conservando firma y vínculo SQL.
    // La firma se crea solo en esta prueba; ninguna respuesta de refresh emite JWT.
    const expiredAccess = await jwt.signAsync(
      { ...payload, exp: Math.floor(Date.now() / 1000) - 60 },
      { secret, algorithm: 'HS256' },
    );
    await assert.rejects(jwt.verifyAsync(expiredAccess, { secret }), /expired/);
    await vencerPlazoSesion(payload.sesionId);
    await authRequest('/vehiculos/consultar', { token: expiredAccess });
    await authRequest('/vehiculos/consultar', { token: expiredAccess });

    // El refresh comprueba el login y mantiene el mismo JTI aunque venza el plazo.
    await vencerPlazoSesion(payload.sesionId);
    const renewed = await authRequest('/auth/renovar-sesion', {
      method: 'POST',
      token: refreshToken,
      status: 201,
    });
    assert.deepEqual(Object.keys(renewed.data).sort(), [
      'loginExpiraEn',
      'sesionId',
      'sessionExpiraEn',
    ]);
    assert.equal(
      (await estadoSesion(payload.sesionId)).session_jti,
      initial.session_jti,
    );
    await authRequest('/vehiculos/consultar', {
      token: expiredAccess,
    });
    await authRequest('/vehiculos/consultar', { token: accessToken });

    for (const changes of [
      { jti: randomUUID() },
      { sesionId: randomUUID() },
      { sub: payload.sub + 1 },
    ]) {
      const unregistered = await jwt.signAsync(
        { ...payload, ...changes },
        { secret },
      );
      await authRequest('/vehiculos/consultar', {
        token: unregistered,
        status: 401,
      });
    }
    await authRequest('/auth/logout', {
      method: 'POST',
      token: refreshToken,
      status: 201,
    });
    await authRequest('/vehiculos/consultar', {
      token: accessToken,
      status: 401,
    });
    await authRequest('/vehiculos/consultar', {
      token: expiredAccess,
      status: 401,
    });
    await authRequest('/auth/renovar-sesion', {
      method: 'POST',
      token: refreshToken,
      status: 401,
    });
    assert.equal((await estadoSesion(payload.sesionId)).activa, false);
    console.log(
      `Mismo accessToken tras vencimiento y refresh; cierre invalida ambos. PostgreSQL en ${zone}: correcto.`,
    );
  }

  await client.query("SELECT set_config('TimeZone', 'UTC', true)");
  const { data: auth } = await authRequest('/auth/login', {
    method: 'POST',
    body: { usuario, password },
    status: 201,
  });
  await authRequest('/auth/login', {
    method: 'POST',
    body: { usuario, password: 'incorrecta' },
    status: 401,
  });
  await authRequest('/vehiculos/consultar', { status: 401 });

  const sessionPayload = JSON.parse(
    Buffer.from(auth.accessToken.split('.')[1], 'base64url'),
  );
  // El plazo renovado nunca sobrepasa el límite absoluto del login.
  await client.query(
    "UPDATE sesiones_usuario SET fecha_expiracion_login=CURRENT_TIMESTAMP + $2 * INTERVAL '1 second' WHERE sesion_id=$1",
    [sessionPayload.sesionId, Math.min(90, auth.sessionExpiraEnMinutos * 30)],
  );
  await vencerPlazoSesion(sessionPayload.sesionId);
  await authRequest('/vehiculos/consultar', {
    token: auth.accessToken,
  });
  const limited = await estadoSesion(sessionPayload.sesionId);
  assert.equal(
    limited.exp,
    limited.login_exp,
    'El plazo de sesión debe limitarse al login',
  );
  await authRequest('/auth/renovar-sesion', {
    method: 'POST',
    token: auth.refreshToken,
    status: 201,
  });

  async function request(resource, operation, method = 'GET', body) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.accessToken}`,
      },
    };
    if (body !== undefined) options.body = JSON.stringify(body);
    const response = await fetch(
      `${baseUrl}/api/${resource}/${operation}`,
      options,
    );
    const result = await response.json();
    assert.equal(
      response.status,
      method === 'POST' ? 201 : 200,
      JSON.stringify(result),
    );
    return result;
  }

  for (const { resource, body: example } of fixtures) {
    const body = { ...example };
    for (const [field, related] of Object.entries(referencias)) {
      if (field in body) body[field] = registros.get(related).id;
    }
    const created = await request(resource, 'agregar', 'POST', body);
    assert.equal(created.exito, true, `${resource}: ${created.mensaje}`);
    registros.set(resource, created.data);
    operations++;

    const found = await request(resource, `buscar/${created.data.id}`);
    assert.deepEqual(found.data, created.data);
    operations++;
    const listed = await request(resource, 'consultar');
    assert.equal(listed.exito, true);
    assert.ok(listed.data.some((row) => row.id === created.data.id));
    operations++;

    const field = Object.keys(body).find((key) =>
      [
        'nombre',
        'observacion',
        'descripcion',
        'estado',
        'hora_fin',
        'total_horas',
        'color',
      ].includes(key),
    );
    assert.ok(field, `Falta un campo para editar ${resource}`);
    const value =
      field === 'hora_fin'
        ? '17:00:00'
        : field === 'total_horas'
          ? 4
          : field === 'estado'
            ? 'REVISADO'
            : 'Actualizado';
    const edited = await request(resource, `editar/${created.data.id}`, 'PUT', {
      [field]: value,
    });
    assert.equal(edited.exito, true, `${resource}: ${edited.mensaje}`);
    assert.deepEqual(edited.data, { ...created.data, [field]: value });
    registros.set(resource, edited.data);
    operations++;
  }

  const relatedDelete = await request(
    'sedes',
    `eliminar/${registros.get('sedes').id}`,
    'DELETE',
  );
  assert.equal(
    relatedDelete.exito,
    false,
    'Debe impedir eliminar una sede con relaciones',
  );
  const { id: _id, ...vehicle } = registros.get('vehiculos');
  const duplicate = await request('vehiculos', 'agregar', 'POST', vehicle);
  assert.equal(duplicate.exito, false, 'Debe rechazar placas duplicadas');

  for (const { resource } of [...fixtures].reverse()) {
    const deleted = await request(
      resource,
      `eliminar/${registros.get(resource).id}`,
      'DELETE',
    );
    assert.equal(deleted.exito, true, `${resource}: ${deleted.mensaje}`);
    operations++;
  }

  // Incluso con el exp del accessToken vigente, el login vencido bloquea ambos.
  await client.query(
    "UPDATE sesiones_usuario SET fecha_expiracion_login=CURRENT_TIMESTAMP - INTERVAL '1 minute' WHERE sesion_id=$1",
    [sessionPayload.sesionId],
  );
  await authRequest('/vehiculos/consultar', {
    token: auth.accessToken,
    status: 401,
  });
  await authRequest('/auth/renovar-sesion', {
    method: 'POST',
    token: auth.refreshToken,
    status: 401,
  });
  await authRequest('/auth/logout', {
    method: 'POST',
    token: auth.refreshToken,
    status: 401,
  });
  assert.equal(
    (await estadoSesion(sessionPayload.sesionId)).exp,
    limited.exp,
    'Un login vencido no puede ampliar el plazo',
  );
  console.log(
    `${authChecks} comprobaciones de autenticación y ${operations} operaciones CRUD HTTP correctas contra PostgreSQL real; duplicados y relaciones verificados.`,
  );
} catch (error) {
  console.error('Fallo en la prueba con PostgreSQL:', error.message);
  process.exitCode = 1;
} finally {
  try {
    if (app) await app.close();
  } finally {
    try {
      if (transactionStarted) {
        await client.query('ROLLBACK');
        console.log(
          'Transaccion revertida: esquema y datos de prueba descartados.',
        );
      }
    } finally {
      await client.end();
    }
  }
}
