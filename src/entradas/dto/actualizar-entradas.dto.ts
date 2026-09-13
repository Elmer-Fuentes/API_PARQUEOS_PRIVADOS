import { PartialType } from '@nestjs/mapped-types';
import { CrearEntradasDto } from './crear-entradas.dto.js';

export class ActualizarEntradasDto extends PartialType(CrearEntradasDto, {
  skipNullProperties: false,
}) {}
