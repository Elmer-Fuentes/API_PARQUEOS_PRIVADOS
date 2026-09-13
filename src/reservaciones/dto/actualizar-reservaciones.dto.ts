import { PartialType } from '@nestjs/mapped-types';
import { CrearReservacionesDto } from './crear-reservaciones.dto.js';

export class ActualizarReservacionesDto extends PartialType(
  CrearReservacionesDto,
  { skipNullProperties: false },
) {}
