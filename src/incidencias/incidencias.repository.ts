import { Injectable } from '@nestjs/common';
import { combinarActualizacion } from '../common/combinar-actualizacion.js';
import { DatabaseService } from '../database/database.service.js';
import { CrearIncidenciasDto } from './dto/crear-incidencias.dto.js';
import { ActualizarIncidenciasDto } from './dto/actualizar-incidencias.dto.js';

@Injectable()
export class IncidenciasRepository {
  constructor(private readonly db: DatabaseService) {}

  async consultar() {
    const r = await this.db.query(
      'SELECT sp_incidencias_consultar() AS resultado',
    );
    return r.rows[0].resultado;
  }

  async buscar(id: number) {
    const r = await this.db.query(
      'SELECT sp_incidencias_buscar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }

  async agregar(dto: CrearIncidenciasDto) {
    const r = await this.db.query(
      'SELECT sp_incidencias_agregar($1, $2, $3, $4, $5, $6, $7) AS resultado',
      [
        dto.sede_id,
        dto.empleado_id,
        dto.vehiculo_id,
        dto.tipo,
        dto.descripcion,
        dto.fecha_hora,
        dto.estado,
      ],
    );
    return r.rows[0].resultado;
  }

  async editar(id: number, dto: ActualizarIncidenciasDto) {
    const actual = await this.buscar(id);
    if (!actual?.exito || !actual?.data) return actual;
    const combinado = combinarActualizacion(
      actual.data,
      dto,
    ) as CrearIncidenciasDto;
    const r = await this.db.query(
      'SELECT sp_incidencias_editar($1, $2, $3, $4, $5, $6, $7, $8) AS resultado',
      [
        id,
        combinado.sede_id,
        combinado.empleado_id,
        combinado.vehiculo_id,
        combinado.tipo,
        combinado.descripcion,
        combinado.fecha_hora,
        combinado.estado,
      ],
    );
    return r.rows[0].resultado;
  }

  async eliminar(id: number) {
    const r = await this.db.query(
      'SELECT sp_incidencias_eliminar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }
}
