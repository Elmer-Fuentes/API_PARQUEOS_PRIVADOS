import { Injectable } from '@nestjs/common';
import { PagosRepository } from './pagos.repository.js';
import { CrearPagosDto } from './dto/crear-pagos.dto.js';
import { ActualizarPagosDto } from './dto/actualizar-pagos.dto.js';

@Injectable()
export class PagosService {
  constructor(private readonly repository: PagosRepository) {}
  consultar() {
    return this.repository.consultar();
  }
  buscar(id: number) {
    return this.repository.buscar(id);
  }
  agregar(dto: CrearPagosDto) {
    return this.repository.agregar(dto);
  }
  editar(id: number, dto: ActualizarPagosDto) {
    return this.repository.editar(id, dto);
  }
  eliminar(id: number) {
    return this.repository.eliminar(id);
  }
}
