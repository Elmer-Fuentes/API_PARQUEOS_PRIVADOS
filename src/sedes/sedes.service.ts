import { Injectable } from '@nestjs/common';
import { SedesRepository } from './sedes.repository.js';
import { CrearSedesDto } from './dto/crear-sedes.dto.js';
import { ActualizarSedesDto } from './dto/actualizar-sedes.dto.js';

@Injectable()
export class SedesService {
  constructor(private readonly repository: SedesRepository) {}
  consultar() {
    return this.repository.consultar();
  }
  buscar(id: number) {
    return this.repository.buscar(id);
  }
  agregar(dto: CrearSedesDto) {
    return this.repository.agregar(dto);
  }
  editar(id: number, dto: ActualizarSedesDto) {
    return this.repository.editar(id, dto);
  }
  eliminar(id: number) {
    return this.repository.eliminar(id);
  }
}
