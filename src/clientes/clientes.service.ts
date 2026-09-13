import { Injectable } from '@nestjs/common';
import { ClientesRepository } from './clientes.repository.js';
import { CrearClientesDto } from './dto/crear-clientes.dto.js';
import { ActualizarClientesDto } from './dto/actualizar-clientes.dto.js';

@Injectable()
export class ClientesService {
  constructor(private readonly repository: ClientesRepository) {}
  consultar() {
    return this.repository.consultar();
  }
  buscar(id: number) {
    return this.repository.buscar(id);
  }
  agregar(dto: CrearClientesDto) {
    return this.repository.agregar(dto);
  }
  editar(id: number, dto: ActualizarClientesDto) {
    return this.repository.editar(id, dto);
  }
  eliminar(id: number) {
    return this.repository.eliminar(id);
  }
}
