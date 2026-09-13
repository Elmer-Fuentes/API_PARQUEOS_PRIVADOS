import { Injectable } from '@nestjs/common';
import { IncidenciasRepository } from './incidencias.repository.js';
import { CrearIncidenciasDto } from './dto/crear-incidencias.dto.js';
import { ActualizarIncidenciasDto } from './dto/actualizar-incidencias.dto.js';

@Injectable()
export class IncidenciasService {
  constructor(private readonly repository: IncidenciasRepository) {}
  consultar() {
    return this.repository.consultar();
  }
  buscar(id: number) {
    return this.repository.buscar(id);
  }
  agregar(dto: CrearIncidenciasDto) {
    return this.repository.agregar(dto);
  }
  editar(id: number, dto: ActualizarIncidenciasDto) {
    return this.repository.editar(id, dto);
  }
  eliminar(id: number) {
    return this.repository.eliminar(id);
  }
}
