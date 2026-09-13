import { Injectable } from '@nestjs/common';
import { combinarActualizacion } from '../common/combinar-actualizacion.js';
import { DatabaseService } from '../database/database.service.js';
import { CrearSalidasDto } from './dto/crear-salidas.dto.js';
import { ActualizarSalidasDto } from './dto/actualizar-salidas.dto.js';

@Injectable()
export class SalidasRepository {
  constructor(private readonly db: DatabaseService) {}

  async consultar() {
    const r = await this.db.query('SELECT sp_salidas_consultar() AS resultado');
    return r.rows[0].resultado;
  }

  async buscar(id: number) {
    const r = await this.db.query('SELECT sp_salidas_buscar($1) AS resultado', [
      id,
    ]);
    return r.rows[0].resultado;
  }

  async agregar(dto: CrearSalidasDto) {
    const r = await this.db.query(
      'SELECT sp_salidas_agregar($1, $2, $3, $4, $5) AS resultado',
      [
        dto.entrada_id,
        dto.empleado_id,
        dto.fecha_hora_salida,
        dto.total_horas,
        dto.monto_calculado,
      ],
    );
    return r.rows[0].resultado;
  }

  async editar(id: number, dto: ActualizarSalidasDto) {
    const actual = await this.buscar(id);
    if (!actual?.exito || !actual?.data) return actual;
    const combinado = combinarActualizacion(
      actual.data,
      dto,
    ) as CrearSalidasDto;
    const r = await this.db.query(
      'SELECT sp_salidas_editar($1, $2, $3, $4, $5, $6) AS resultado',
      [
        id,
        combinado.entrada_id,
        combinado.empleado_id,
        combinado.fecha_hora_salida,
        combinado.total_horas,
        combinado.monto_calculado,
      ],
    );
    return r.rows[0].resultado;
  }

  async eliminar(id: number) {
    const r = await this.db.query(
      'SELECT sp_salidas_eliminar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }
}
