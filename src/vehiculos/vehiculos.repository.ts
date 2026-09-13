import { Injectable } from '@nestjs/common';
import { combinarActualizacion } from '../common/combinar-actualizacion.js';
import { DatabaseService } from '../database/database.service.js';
import { CrearVehiculosDto } from './dto/crear-vehiculos.dto.js';
import { ActualizarVehiculosDto } from './dto/actualizar-vehiculos.dto.js';

@Injectable()
export class VehiculosRepository {
  constructor(private readonly db: DatabaseService) {}

  async consultar() {
    const r = await this.db.query(
      'SELECT sp_vehiculos_consultar() AS resultado',
    );
    return r.rows[0].resultado;
  }

  async buscar(id: number) {
    const r = await this.db.query(
      'SELECT sp_vehiculos_buscar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }

  async agregar(dto: CrearVehiculosDto) {
    const r = await this.db.query(
      'SELECT sp_vehiculos_agregar($1, $2, $3, $4, $5, $6, $7) AS resultado',
      [
        dto.cliente_id,
        dto.tipo_vehiculo_id,
        dto.placa,
        dto.marca,
        dto.modelo,
        dto.color,
        dto.activo,
      ],
    );
    return r.rows[0].resultado;
  }

  async editar(id: number, dto: ActualizarVehiculosDto) {
    const actual = await this.buscar(id);
    if (!actual?.exito || !actual?.data) return actual;
    const combinado = combinarActualizacion(
      actual.data,
      dto,
    ) as CrearVehiculosDto;
    const r = await this.db.query(
      'SELECT sp_vehiculos_editar($1, $2, $3, $4, $5, $6, $7, $8) AS resultado',
      [
        id,
        combinado.cliente_id,
        combinado.tipo_vehiculo_id,
        combinado.placa,
        combinado.marca,
        combinado.modelo,
        combinado.color,
        combinado.activo,
      ],
    );
    return r.rows[0].resultado;
  }

  async eliminar(id: number) {
    const r = await this.db.query(
      'SELECT sp_vehiculos_eliminar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }
}
