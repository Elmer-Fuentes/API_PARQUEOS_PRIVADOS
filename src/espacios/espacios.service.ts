import { Injectable } from '@nestjs/common';
import { EspaciosRepository } from './espacios.repository.js';
import { CrearEspaciosDto } from './dto/crear-espacios.dto.js';
import { ActualizarEspaciosDto } from './dto/actualizar-espacios.dto.js';

@Injectable()
export class EspaciosService {
  constructor(private readonly repository: EspaciosRepository) {}
  consultar() {
    return this.repository.consultar();
  }
  buscar(id: number) {
    return this.repository.buscar(id);
  }
  agregar(dto: CrearEspaciosDto) {
    return this.repository.agregar(dto);
  }
  editar(id: number, dto: ActualizarEspaciosDto) {
    return this.repository.editar(id, dto);
  }
  eliminar(id: number) {
    return this.repository.eliminar(id);
  }
}
