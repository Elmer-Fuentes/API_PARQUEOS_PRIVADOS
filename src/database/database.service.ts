import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import pg from 'pg';

const { Pool } = pg;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool!: pg.Pool;

  onModuleInit() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'parqueo_privados_gt',
      connectionTimeoutMillis: 5000,
    });
    this.pool.on('error', (error: Error) => {
      this.logger.error(
        'Error en una conexion inactiva de PostgreSQL.',
        error.stack,
      );
    });
  }

  async query<T extends pg.QueryResultRow = any>(
    text: string,
    params: any[] = [],
  ) {
    return this.pool.query<T>(text, params);
  }

  async probarConexion() {
    try {
      const result = await this.pool.query('SELECT NOW() AS fecha_servidor');
      return {
        exito: true,
        mensaje: 'Conexión exitosa a PostgreSQL.',
        data: result.rows[0],
      };
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido';
      return {
        exito: false,
        mensaje: `Error de conexión: ${mensaje}`,
        data: null,
      };
    }
  }

  async onModuleDestroy() {
    if (this.pool) await this.pool.end();
  }
}
