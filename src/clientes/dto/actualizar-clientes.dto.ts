import { PartialType } from '@nestjs/mapped-types';
import { CrearClientesDto } from './crear-clientes.dto.js';

export class ActualizarClientesDto extends PartialType(CrearClientesDto, {
  skipNullProperties: false,
}) {}
