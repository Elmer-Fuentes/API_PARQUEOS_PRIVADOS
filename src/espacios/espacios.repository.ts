import { Injectable } from '@nestjs/common';
import { combinarActualizacion } from '../common/combinar-actualizacion.js';
import { DatabaseService } from '../database/database.service.js';
import { CrearEspaciosDto } from './dto/crear-espacios.dto.js';
import { ActualizarEspaciosDto } from './dto/actualizar-espacios.dto.js';

@Injectable()
export class EspaciosRepository {
  constructor(private readonly db: DatabaseService) {}

  async consultar() {
    const r = await this.db.query(
      'SELECT sp_espacios_consultar() AS resultado',
    );
    return r.rows[0].resultado;
  }

  async buscar(id: number) {
    const r = await this.db.query(
      'SELECT sp_espacios_buscar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }

  async agregar(dto: CrearEspaciosDto) {
    const r = await this.db.query(
      'SELECT sp_espacios_agregar($1, $2, $3, $4, $5, $6) AS resultado',
      [
        dto.sede_id,
        dto.tipo_vehiculo_id,
        dto.codigo,
        dto.nivel,
        dto.estado,
        dto.activo,
      ],
    );
    return r.rows[0].resultado;
  }

  async editar(id: number, dto: ActualizarEspaciosDto) {
    const actual = await this.buscar(id);
    if (!actual?.exito || !actual?.data) return actual;
    const combinado = combinarActualizacion(
      actual.data,
      dto,
    ) as CrearEspaciosDto;
    const r = await this.db.query(
      'SELECT sp_espacios_editar($1, $2, $3, $4, $5, $6, $7) AS resultado',
      [
        id,
        combinado.sede_id,
        combinado.tipo_vehiculo_id,
        combinado.codigo,
        combinado.nivel,
        combinado.estado,
        combinado.activo,
      ],
    );
    return r.rows[0].resultado;
  }

  async eliminar(id: number) {
    const r = await this.db.query(
      'SELECT sp_espacios_eliminar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }
}
