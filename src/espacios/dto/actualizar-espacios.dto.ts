import { PartialType } from '@nestjs/mapped-types';
import { CrearEspaciosDto } from './crear-espacios.dto.js';

export class ActualizarEspaciosDto extends PartialType(CrearEspaciosDto, {
  skipNullProperties: false,
}) {}
