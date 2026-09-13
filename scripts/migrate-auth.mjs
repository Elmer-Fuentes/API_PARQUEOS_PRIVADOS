import { readFileSync } from 'node:fs';
import pg from 'pg';

const client = new pg.Client({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'parqueo_privados_gt',
  connectionTimeoutMillis: 5000,
});
let transactionStarted = false;
try {
  await client.connect();
  await client.query('BEGIN');
  transactionStarted = true;
  await client.query("SET LOCAL lock_timeout = '5s'");
  await client.query(readFileSync(new URL('../sql/01_refresh_tokens.sql', import.meta.url), 'utf8'));
  await client.query('COMMIT');
  transactionStarted = false;
  console.log('Migración de refresh tokens aplicada. Las sesiones existentes se conservaron.');
} catch (error) {
  if (transactionStarted) await client.query('ROLLBACK');
  console.error('No se pudo aplicar la migración de autenticación:', error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
