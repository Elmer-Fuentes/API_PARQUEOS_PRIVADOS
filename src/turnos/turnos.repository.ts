import { Injectable } from '@nestjs/common';
import { combinarActualizacion } from '../common/combinar-actualizacion.js';
import { DatabaseService } from '../database/database.service.js';
import { CrearTurnosDto } from './dto/crear-turnos.dto.js';
import { ActualizarTurnosDto } from './dto/actualizar-turnos.dto.js';

@Injectable()
export class TurnosRepository {
  constructor(private readonly db: DatabaseService) {}

  async consultar() {
    const r = await this.db.query('SELECT sp_turnos_consultar() AS resultado');
    return r.rows[0].resultado;
  }

  async buscar(id: number) {
    const r = await this.db.query('SELECT sp_turnos_buscar($1) AS resultado', [
      id,
    ]);
    return r.rows[0].resultado;
  }

  async agregar(dto: CrearTurnosDto) {
    const r = await this.db.query(
      'SELECT sp_turnos_agregar($1, $2, $3, $4, $5) AS resultado',
      [dto.empleado_id, dto.fecha, dto.hora_inicio, dto.hora_fin, dto.activo],
    );
    return r.rows[0].resultado;
  }

  async editar(id: number, dto: ActualizarTurnosDto) {
    const actual = await this.buscar(id);
    if (!actual?.exito || !actual?.data) return actual;
    const combinado = combinarActualizacion(actual.data, dto) as CrearTurnosDto;
    const r = await this.db.query(
      'SELECT sp_turnos_editar($1, $2, $3, $4, $5, $6) AS resultado',
      [
        id,
        combinado.empleado_id,
        combinado.fecha,
        combinado.hora_inicio,
        combinado.hora_fin,
        combinado.activo,
      ],
    );
    return r.rows[0].resultado;
  }

  async eliminar(id: number) {
    const r = await this.db.query(
      'SELECT sp_turnos_eliminar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }
}
