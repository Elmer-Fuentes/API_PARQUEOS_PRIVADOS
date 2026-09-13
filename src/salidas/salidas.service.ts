import { Injectable } from '@nestjs/common';
import { SalidasRepository } from './salidas.repository.js';
import { CrearSalidasDto } from './dto/crear-salidas.dto.js';
import { ActualizarSalidasDto } from './dto/actualizar-salidas.dto.js';

@Injectable()
export class SalidasService {
  constructor(private readonly repository: SalidasRepository) {}
  consultar() {
    return this.repository.consultar();
  }
  buscar(id: number) {
    return this.repository.buscar(id);
  }
  agregar(dto: CrearSalidasDto) {
    return this.repository.agregar(dto);
  }
  editar(id: number, dto: ActualizarSalidasDto) {
    return this.repository.editar(id, dto);
  }
  eliminar(id: number) {
    return this.repository.eliminar(id);
  }
}
