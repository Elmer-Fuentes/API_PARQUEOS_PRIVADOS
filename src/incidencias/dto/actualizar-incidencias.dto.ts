import { PartialType } from '@nestjs/mapped-types';
import { CrearIncidenciasDto } from './crear-incidencias.dto.js';

export class ActualizarIncidenciasDto extends PartialType(CrearIncidenciasDto, {
  skipNullProperties: false,
}) {}
