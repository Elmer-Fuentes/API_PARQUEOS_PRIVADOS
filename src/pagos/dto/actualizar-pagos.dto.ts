import { PartialType } from '@nestjs/mapped-types';
import { CrearPagosDto } from './crear-pagos.dto.js';

export class ActualizarPagosDto extends PartialType(CrearPagosDto, {
  skipNullProperties: false,
}) {}
