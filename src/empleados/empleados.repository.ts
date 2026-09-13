import { Injectable } from '@nestjs/common';
import { combinarActualizacion } from '../common/combinar-actualizacion.js';
import { DatabaseService } from '../database/database.service.js';
import { CrearEmpleadosDto } from './dto/crear-empleados.dto.js';
import { ActualizarEmpleadosDto } from './dto/actualizar-empleados.dto.js';

@Injectable()
export class EmpleadosRepository {
  constructor(private readonly db: DatabaseService) {}

  async consultar() {
    const r = await this.db.query(
      'SELECT sp_empleados_consultar() AS resultado',
    );
    return r.rows[0].resultado;
  }

  async buscar(id: number) {
    const r = await this.db.query(
      'SELECT sp_empleados_buscar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }

  async agregar(dto: CrearEmpleadosDto) {
    const r = await this.db.query(
      'SELECT sp_empleados_agregar($1, $2, $3, $4, $5, $6) AS resultado',
      [dto.sede_id, dto.nombre, dto.dpi, dto.puesto, dto.telefono, dto.activo],
    );
    return r.rows[0].resultado;
  }

  async editar(id: number, dto: ActualizarEmpleadosDto) {
    const actual = await this.buscar(id);
    if (!actual?.exito || !actual?.data) return actual;
    const combinado = combinarActualizacion(
      actual.data,
      dto,
    ) as CrearEmpleadosDto;
    const r = await this.db.query(
      'SELECT sp_empleados_editar($1, $2, $3, $4, $5, $6, $7) AS resultado',
      [
        id,
        combinado.sede_id,
        combinado.nombre,
        combinado.dpi,
        combinado.puesto,
        combinado.telefono,
        combinado.activo,
      ],
    );
    return r.rows[0].resultado;
  }

  async eliminar(id: number) {
    const r = await this.db.query(
      'SELECT sp_empleados_eliminar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }
}
