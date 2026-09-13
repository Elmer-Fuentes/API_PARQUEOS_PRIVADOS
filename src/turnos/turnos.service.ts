import { Injectable } from '@nestjs/common';
import { TurnosRepository } from './turnos.repository.js';
import { CrearTurnosDto } from './dto/crear-turnos.dto.js';
import { ActualizarTurnosDto } from './dto/actualizar-turnos.dto.js';

@Injectable()
export class TurnosService {
  constructor(private readonly repository: TurnosRepository) {}
  consultar() {
    return this.repository.consultar();
  }
  buscar(id: number) {
    return this.repository.buscar(id);
  }
  agregar(dto: CrearTurnosDto) {
    return this.repository.agregar(dto);
  }
  editar(id: number, dto: ActualizarTurnosDto) {
    return this.repository.editar(id, dto);
  }
  eliminar(id: number) {
    return this.repository.eliminar(id);
  }
}
