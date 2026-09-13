import { Injectable } from '@nestjs/common';
import { combinarActualizacion } from '../common/combinar-actualizacion.js';
import { DatabaseService } from '../database/database.service.js';
import { CrearPagosDto } from './dto/crear-pagos.dto.js';
import { ActualizarPagosDto } from './dto/actualizar-pagos.dto.js';

@Injectable()
export class PagosRepository {
  constructor(private readonly db: DatabaseService) {}

  async consultar() {
    const r = await this.db.query('SELECT sp_pagos_consultar() AS resultado');
    return r.rows[0].resultado;
  }

  async buscar(id: number) {
    const r = await this.db.query('SELECT sp_pagos_buscar($1) AS resultado', [
      id,
    ]);
    return r.rows[0].resultado;
  }

  async agregar(dto: CrearPagosDto) {
    const r = await this.db.query(
      'SELECT sp_pagos_agregar($1, $2, $3, $4, $5, $6, $7) AS resultado',
      [
        dto.salida_id,
        dto.cliente_id,
        dto.monto,
        dto.metodo_pago,
        dto.fecha_pago,
        dto.referencia,
        dto.estado,
      ],
    );
    return r.rows[0].resultado;
  }

  async editar(id: number, dto: ActualizarPagosDto) {
    const actual = await this.buscar(id);
    if (!actual?.exito || !actual?.data) return actual;
    const combinado = combinarActualizacion(actual.data, dto) as CrearPagosDto;
    const r = await this.db.query(
      'SELECT sp_pagos_editar($1, $2, $3, $4, $5, $6, $7, $8) AS resultado',
      [
        id,
        combinado.salida_id,
        combinado.cliente_id,
        combinado.monto,
        combinado.metodo_pago,
        combinado.fecha_pago,
        combinado.referencia,
        combinado.estado,
      ],
    );
    return r.rows[0].resultado;
  }

  async eliminar(id: number) {
    const r = await this.db.query('SELECT sp_pagos_eliminar($1) AS resultado', [
      id,
    ]);
    return r.rows[0].resultado;
  }
}
