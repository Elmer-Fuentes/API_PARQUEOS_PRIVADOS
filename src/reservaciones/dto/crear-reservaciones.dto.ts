import {
  IsDateString,
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearReservacionesDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  cliente_id: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  vehiculo_id: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  espacio_id: number;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '$property debe tener formato YYYY-MM-DD',
  })
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  fecha_reserva: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,6})?)?$/, {
    message: '$property debe tener formato HH:mm o HH:mm:ss',
  })
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  hora_inicio: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,6})?)?$/, {
    message: '$property debe tener formato HH:mm o HH:mm:ss',
  })
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  hora_fin: string;

  @IsString()
  @MaxLength(20)
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  estado: string;
}
