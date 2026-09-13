import { PartialType } from '@nestjs/mapped-types';
import { CrearSedesDto } from './crear-sedes.dto.js';

export class ActualizarSedesDto extends PartialType(CrearSedesDto, {
  skipNullProperties: false,
}) {}
