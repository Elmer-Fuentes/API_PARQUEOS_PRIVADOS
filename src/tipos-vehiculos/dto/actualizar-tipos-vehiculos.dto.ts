import { PartialType } from '@nestjs/mapped-types';
import { CrearTiposVehiculosDto } from './crear-tipos-vehiculos.dto.js';

export class ActualizarTiposVehiculosDto extends PartialType(
  CrearTiposVehiculosDto,
  { skipNullProperties: false },
) {}
