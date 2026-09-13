import { Injectable } from '@nestjs/common';
import { combinarActualizacion } from '../common/combinar-actualizacion.js';
import { DatabaseService } from '../database/database.service.js';
import { CrearClientesDto } from './dto/crear-clientes.dto.js';
import { ActualizarClientesDto } from './dto/actualizar-clientes.dto.js';

@Injectable()
export class ClientesRepository {
  constructor(private readonly db: DatabaseService) {}

  async consultar() {
    const r = await this.db.query(
      'SELECT sp_clientes_consultar() AS resultado',
    );
    return r.rows[0].resultado;
  }

  async buscar(id: number) {
    const r = await this.db.query(
      'SELECT sp_clientes_buscar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }

  async agregar(dto: CrearClientesDto) {
    const r = await this.db.query(
      'SELECT sp_clientes_agregar($1, $2, $3, $4, $5) AS resultado',
      [dto.nombre, dto.nit, dto.telefono, dto.correo, dto.activo],
    );
    return r.rows[0].resultado;
  }

  async editar(id: number, dto: ActualizarClientesDto) {
    const actual = await this.buscar(id);
    if (!actual?.exito || !actual?.data) return actual;
    const combinado = combinarActualizacion(
      actual.data,
      dto,
    ) as CrearClientesDto;
    const r = await this.db.query(
      'SELECT sp_clientes_editar($1, $2, $3, $4, $5, $6) AS resultado',
      [
        id,
        combinado.nombre,
        combinado.nit,
        combinado.telefono,
        combinado.correo,
        combinado.activo,
      ],
    );
    return r.rows[0].resultado;
  }

  async eliminar(id: number) {
    const r = await this.db.query(
      'SELECT sp_clientes_eliminar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }
}
