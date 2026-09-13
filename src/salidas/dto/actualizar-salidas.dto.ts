import { PartialType } from '@nestjs/mapped-types';
import { CrearSalidasDto } from './crear-salidas.dto.js';

export class ActualizarSalidasDto extends PartialType(CrearSalidasDto, {
  skipNullProperties: false,
}) {}
