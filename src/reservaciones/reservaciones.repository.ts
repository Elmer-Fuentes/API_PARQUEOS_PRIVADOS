import { Injectable } from '@nestjs/common';
import { combinarActualizacion } from '../common/combinar-actualizacion.js';
import { DatabaseService } from '../database/database.service.js';
import { CrearReservacionesDto } from './dto/crear-reservaciones.dto.js';
import { ActualizarReservacionesDto } from './dto/actualizar-reservaciones.dto.js';

@Injectable()
export class ReservacionesRepository {
  constructor(private readonly db: DatabaseService) {}

  async consultar() {
    const r = await this.db.query(
      'SELECT sp_reservaciones_consultar() AS resultado',
    );
    return r.rows[0].resultado;
  }

  async buscar(id: number) {
    const r = await this.db.query(
      'SELECT sp_reservaciones_buscar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }

  async agregar(dto: CrearReservacionesDto) {
    const r = await this.db.query(
      'SELECT sp_reservaciones_agregar($1, $2, $3, $4, $5, $6, $7) AS resultado',
      [
        dto.cliente_id,
        dto.vehiculo_id,
        dto.espacio_id,
        dto.fecha_reserva,
        dto.hora_inicio,
        dto.hora_fin,
        dto.estado,
      ],
    );
    return r.rows[0].resultado;
  }

  async editar(id: number, dto: ActualizarReservacionesDto) {
    const actual = await this.buscar(id);
    if (!actual?.exito || !actual?.data) return actual;
    const combinado = combinarActualizacion(
      actual.data,
      dto,
    ) as CrearReservacionesDto;
    const r = await this.db.query(
      'SELECT sp_reservaciones_editar($1, $2, $3, $4, $5, $6, $7, $8) AS resultado',
      [
        id,
        combinado.cliente_id,
        combinado.vehiculo_id,
        combinado.espacio_id,
        combinado.fecha_reserva,
        combinado.hora_inicio,
        combinado.hora_fin,
        combinado.estado,
      ],
    );
    return r.rows[0].resultado;
  }

  async eliminar(id: number) {
    const r = await this.db.query(
      'SELECT sp_reservaciones_eliminar($1) AS resultado',
      [id],
    );
    return r.rows[0].resultado;
  }
}
