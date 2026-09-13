import { Injectable } from '@nestjs/common';
import { TarifasRepository } from './tarifas.repository.js';
import { CrearTarifasDto } from './dto/crear-tarifas.dto.js';
import { ActualizarTarifasDto } from './dto/actualizar-tarifas.dto.js';

@Injectable()
export class TarifasService {
  constructor(private readonly repository: TarifasRepository) {}
  consultar() {
    return this.repository.consultar();
  }
  buscar(id: number) {
    return this.repository.buscar(id);
  }
  agregar(dto: CrearTarifasDto) {
    return this.repository.agregar(dto);
  }
  editar(id: number, dto: ActualizarTarifasDto) {
    return this.repository.editar(id, dto);
  }
  eliminar(id: number) {
    return this.repository.eliminar(id);
  }
}
