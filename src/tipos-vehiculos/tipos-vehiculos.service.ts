import { Injectable } from '@nestjs/common';
import { TiposVehiculosRepository } from './tipos-vehiculos.repository.js';
import { CrearTiposVehiculosDto } from './dto/crear-tipos-vehiculos.dto.js';
import { ActualizarTiposVehiculosDto } from './dto/actualizar-tipos-vehiculos.dto.js';

@Injectable()
export class TiposVehiculosService {
  constructor(private readonly repository: TiposVehiculosRepository) {}
  consultar() {
    return this.repository.consultar();
  }
  buscar(id: number) {
    return this.repository.buscar(id);
  }
  agregar(dto: CrearTiposVehiculosDto) {
    return this.repository.agregar(dto);
  }
  editar(id: number, dto: ActualizarTiposVehiculosDto) {
    return this.repository.editar(id, dto);
  }
  eliminar(id: number) {
    return this.repository.eliminar(id);
  }
}
