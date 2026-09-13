import { PartialType } from '@nestjs/mapped-types';
import { CrearEmpleadosDto } from './crear-empleados.dto.js';

export class ActualizarEmpleadosDto extends PartialType(CrearEmpleadosDto, {
  skipNullProperties: false,
}) {}
