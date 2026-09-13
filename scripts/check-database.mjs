import pg from 'pg';

const client = new pg.Client({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'parqueo_privados_gt',
  connectionTimeoutMillis: 5000,
});

const recursos = [
  'sedes',
  'clientes',
  'tipos_vehiculos',
  'vehiculos',
  'tarifas',
  'espacios',
  'empleados',
  'turnos',
  'reservaciones',
  'entradas',
  'salidas',
  'pagos',
  'incidencias',
];
const operaciones = ['consultar', 'buscar', 'agregar', 'editar', 'eliminar'];

try {
  await client.connect();
  const { rows } = await client.query(
    'SELECT proname FROM pg_proc WHERE pg_function_is_visible(oid) AND proname = ANY($1::text[])',
    [
      recursos.flatMap((recurso) =>
        operaciones.map((operacion) => `sp_${recurso}_${operacion}`),
      ),
    ],
  );
  const existentes = new Set(rows.map((row) => row.proname));
  const faltantes = recursos
    .flatMap((recurso) =>
      operaciones.map((operacion) => `sp_${recurso}_${operacion}`),
    )
    .filter((nombre) => !existentes.has(nombre));
  if (faltantes.length) {
    console.error(
      'Conexion correcta, pero faltan funciones SQL:',
      faltantes.join(', '),
    );
    console.error(
      'Ejecuta los scripts de Database en el orden indicado en el README.',
    );
    process.exitCode = 1;
  } else {
    console.log(
      'Conexion PostgreSQL correcta. Las 65 funciones CRUD estan disponibles.',
    );
  }
} catch (error) {
  console.error(
    `No se pudo verificar PostgreSQL (${error.code || 'ERROR'}): ${error.message}`,
  );
  if (error.code === '28P01')
    console.error('Revisa DB_USER y DB_PASSWORD en .env.');
  process.exitCode = 1;
} finally {
  await client.end();
}
