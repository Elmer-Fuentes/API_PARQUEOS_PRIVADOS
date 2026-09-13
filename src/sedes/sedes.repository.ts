import { Injectable } from '@nestjs/common';
import { combinarActualizacion } from '../common/combinar-actualizacion.js';
import { DatabaseService } from '../database/database.service.js';
import { CrearSedesDto } from './dto/crear-sedes.dto.js';
import { ActualizarSedesDto } from './dto/actualizar-sedes.dto.js';

@Injectable()
export class SedesRepository {
  constructor(private readonly db: DatabaseService) {}

  async consultar() {
    const r = await this.db.query('SELECT sp_sedes_consultar() AS resultado');
    return r.rows[0].resultado;
  }

  async buscar(id: number) {
    const r = await this.db.query('SELECT sp_sedes_buscar($1) AS resultado', [
      id,
    ]);
    return r.rows[0].resultado;
  }

  async agregar(dto: CrearSedesDto) {
    const r = await this.db.query(
      'SELECT sp_sedes_agregar($1, $2, $3, $4) AS resultado',
      [dto.nombre, dto.direccion, dto.telefono, dto.activo],
    );
    return r.rows[0].resultado;
  }

  async editar(id: number, dto: ActualizarSedesDto) {
    const actual = await this.buscar(id);
    if (!actual?.exito || !actual?.data) return actual;
    const combinado = combinarActualizacion(actual.data, dto) as CrearSedesDto;
    const r = await this.db.query(
      'SELECT sp_sedes_editar($1, $2, $3, $4, $5) AS resultado',
      [
        id,
        combinado.nombre,
        combinado.direccion,
        combinado.telefono,
        combinado.activo,
      ],
    );
    return r.rows[0].resultado;
  }

  async eliminar(id: number) {
    const r = await this.db.query('SELECT sp_sedes_eliminar($1) AS resultado', [
      id,
    ]);
    return r.rows[0].resultado;
  }
}
