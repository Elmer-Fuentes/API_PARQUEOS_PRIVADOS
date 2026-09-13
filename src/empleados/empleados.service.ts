import { Injectable } from '@nestjs/common';
import { EmpleadosRepository } from './empleados.repository.js';
import { CrearEmpleadosDto } from './dto/crear-empleados.dto.js';
import { ActualizarEmpleadosDto } from './dto/actualizar-empleados.dto.js';

@Injectable()
export class EmpleadosService {
  constructor(private readonly repository: EmpleadosRepository) {}
  consultar() {
    return this.repository.consultar();
  }
  buscar(id: number) {
    return this.repository.buscar(id);
  }
  agregar(dto: CrearEmpleadosDto) {
    return this.repository.agregar(dto);
  }
  editar(id: number, dto: ActualizarEmpleadosDto) {
    return this.repository.editar(id, dto);
  }
  eliminar(id: number) {
    return this.repository.eliminar(id);
  }
}
