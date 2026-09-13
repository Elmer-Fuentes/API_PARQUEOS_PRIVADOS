import { Injectable } from '@nestjs/common';
import { VehiculosRepository } from './vehiculos.repository.js';
import { CrearVehiculosDto } from './dto/crear-vehiculos.dto.js';
import { ActualizarVehiculosDto } from './dto/actualizar-vehiculos.dto.js';

@Injectable()
export class VehiculosService {
  constructor(private readonly repository: VehiculosRepository) {}
  consultar() {
    return this.repository.consultar();
  }
  buscar(id: number) {
    return this.repository.buscar(id);
  }
  agregar(dto: CrearVehiculosDto) {
    return this.repository.agregar(dto);
  }
  editar(id: number, dto: ActualizarVehiculosDto) {
    return this.repository.editar(id, dto);
  }
  eliminar(id: number) {
    return this.repository.eliminar(id);
  }
}
