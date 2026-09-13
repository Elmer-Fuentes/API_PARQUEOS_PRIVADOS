import { Injectable } from '@nestjs/common';
import { EntradasRepository } from './entradas.repository.js';
import { CrearEntradasDto } from './dto/crear-entradas.dto.js';
import { ActualizarEntradasDto } from './dto/actualizar-entradas.dto.js';

@Injectable()
export class EntradasService {
  constructor(private readonly repository: EntradasRepository) {}
  consultar() {
    return this.repository.consultar();
  }
  buscar(id: number) {
    return this.repository.buscar(id);
  }
  agregar(dto: CrearEntradasDto) {
    return this.repository.agregar(dto);
  }
  editar(id: number, dto: ActualizarEntradasDto) {
    return this.repository.editar(id, dto);
  }
  eliminar(id: number) {
    return this.repository.eliminar(id);
  }
}
