import { PartialType } from '@nestjs/mapped-types';
import { CrearTarifasDto } from './crear-tarifas.dto.js';

export class ActualizarTarifasDto extends PartialType(CrearTarifasDto, {
  skipNullProperties: false,
}) {}
