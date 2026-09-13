import { Injectable } from '@nestjs/common';
import { combinarActualizacion } from '../common/combinar-actualizacion.js';
import { DatabaseService } from '../database/database.service.js';
import { CrearTiposVehiculosDto } from './dto/crear-tipos-vehiculos.dto.js';
import { ActualizarTiposVehiculosDto } from './dto/actualizar-tipos-vehiculos.dto.js';

@Injectable()
export class TiposVehiculosRepository {
  constructor(private readonly db: DatabaseService) {}

  async consultar() {
    const r = await this.db.query(
      'SELECT sp_tipos_vehiculos_consultar() AS resultado',
    );
    return r.rows[0].resultado;
  }

  async buscar(id: number) {
    const r = await this.db.query(
      'SELECT sp_tipos_vehiculos_buscar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }

  async agregar(dto: CrearTiposVehiculosDto) {
    const r = await this.db.query(
      'SELECT sp_tipos_vehiculos_agregar($1, $2, $3) AS resultado',
      [dto.nombre, dto.descripcion, dto.activo],
    );
    return r.rows[0].resultado;
  }

  async editar(id: number, dto: ActualizarTiposVehiculosDto) {
    const actual = await this.buscar(id);
    if (!actual?.exito || !actual?.data) return actual;
    const combinado = combinarActualizacion(
      actual.data,
      dto,
    ) as CrearTiposVehiculosDto;
    const r = await this.db.query(
      'SELECT sp_tipos_vehiculos_editar($1, $2, $3, $4) AS resultado',
      [id, combinado.nombre, combinado.descripcion, combinado.activo],
    );
    return r.rows[0].resultado;
  }

  async eliminar(id: number) {
    const r = await this.db.query(
      'SELECT sp_tipos_vehiculos_eliminar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }
}
