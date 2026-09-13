import { Injectable } from '@nestjs/common';
import { combinarActualizacion } from '../common/combinar-actualizacion.js';
import { DatabaseService } from '../database/database.service.js';
import { CrearTarifasDto } from './dto/crear-tarifas.dto.js';
import { ActualizarTarifasDto } from './dto/actualizar-tarifas.dto.js';

@Injectable()
export class TarifasRepository {
  constructor(private readonly db: DatabaseService) {}

  async consultar() {
    const r = await this.db.query('SELECT sp_tarifas_consultar() AS resultado');
    return r.rows[0].resultado;
  }

  async buscar(id: number) {
    const r = await this.db.query('SELECT sp_tarifas_buscar($1) AS resultado', [
      id,
    ]);
    return r.rows[0].resultado;
  }

  async agregar(dto: CrearTarifasDto) {
    const r = await this.db.query(
      'SELECT sp_tarifas_agregar($1, $2, $3, $4, $5, $6) AS resultado',
      [
        dto.sede_id,
        dto.tipo_vehiculo_id,
        dto.nombre,
        dto.precio_hora,
        dto.precio_dia,
        dto.activo,
      ],
    );
    return r.rows[0].resultado;
  }

  async editar(id: number, dto: ActualizarTarifasDto) {
    const actual = await this.buscar(id);
    if (!actual?.exito || !actual?.data) return actual;
    const combinado = combinarActualizacion(
      actual.data,
      dto,
    ) as CrearTarifasDto;
    const r = await this.db.query(
      'SELECT sp_tarifas_editar($1, $2, $3, $4, $5, $6, $7) AS resultado',
      [
        id,
        combinado.sede_id,
        combinado.tipo_vehiculo_id,
        combinado.nombre,
        combinado.precio_hora,
        combinado.precio_dia,
        combinado.activo,
      ],
    );
    return r.rows[0].resultado;
  }

  async eliminar(id: number) {
    const r = await this.db.query(
      'SELECT sp_tarifas_eliminar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }
}
