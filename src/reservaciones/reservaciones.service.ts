import { Injectable } from '@nestjs/common';
import { ReservacionesRepository } from './reservaciones.repository.js';
import { CrearReservacionesDto } from './dto/crear-reservaciones.dto.js';
import { ActualizarReservacionesDto } from './dto/actualizar-reservaciones.dto.js';

@Injectable()
export class ReservacionesService {
  constructor(private readonly repository: ReservacionesRepository) {}
  consultar() {
    return this.repository.consultar();
  }
  buscar(id: number) {
    return this.repository.buscar(id);
  }
  agregar(dto: CrearReservacionesDto) {
    return this.repository.agregar(dto);
  }
  editar(id: number, dto: ActualizarReservacionesDto) {
    return this.repository.editar(id, dto);
  }
  eliminar(id: number) {
    return this.repository.eliminar(id);
  }
}
