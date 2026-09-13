import { Injectable } from '@nestjs/common';
import { combinarActualizacion } from '../common/combinar-actualizacion.js';
import { DatabaseService } from '../database/database.service.js';
import { CrearEntradasDto } from './dto/crear-entradas.dto.js';
import { ActualizarEntradasDto } from './dto/actualizar-entradas.dto.js';

@Injectable()
export class EntradasRepository {
  constructor(private readonly db: DatabaseService) {}

  async consultar() {
    const r = await this.db.query(
      'SELECT sp_entradas_consultar() AS resultado',
    );
    return r.rows[0].resultado;
  }

  async buscar(id: number) {
    const r = await this.db.query(
      'SELECT sp_entradas_buscar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }

  async agregar(dto: CrearEntradasDto) {
    const r = await this.db.query(
      'SELECT sp_entradas_agregar($1, $2, $3, $4, $5) AS resultado',
      [
        dto.vehiculo_id,
        dto.espacio_id,
        dto.empleado_id,
        dto.fecha_hora_entrada,
        dto.observacion,
      ],
    );
    return r.rows[0].resultado;
  }

  async editar(id: number, dto: ActualizarEntradasDto) {
    const actual = await this.buscar(id);
    if (!actual?.exito || !actual?.data) return actual;
    const combinado = combinarActualizacion(
      actual.data,
      dto,
    ) as CrearEntradasDto;
    const r = await this.db.query(
      'SELECT sp_entradas_editar($1, $2, $3, $4, $5, $6) AS resultado',
      [
        id,
        combinado.vehiculo_id,
        combinado.espacio_id,
        combinado.empleado_id,
        combinado.fecha_hora_entrada,
        combinado.observacion,
      ],
    );
    return r.rows[0].resultado;
  }

  async eliminar(id: number) {
    const r = await this.db.query(
      'SELECT sp_entradas_eliminar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }
}
