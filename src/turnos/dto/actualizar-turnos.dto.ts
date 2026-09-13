import { PartialType } from '@nestjs/mapped-types';
import { CrearTurnosDto } from './crear-turnos.dto.js';

export class ActualizarTurnosDto extends PartialType(CrearTurnosDto, {
  skipNullProperties: false,
}) {}
