import { PartialType } from '@nestjs/mapped-types';
import { CrearVehiculosDto } from './crear-vehiculos.dto.js';

export class ActualizarVehiculosDto extends PartialType(CrearVehiculosDto, {
  skipNullProperties: false,
}) {}
