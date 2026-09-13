import {
  IsDateString,
  IsInt,
  IsNumber,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CrearSalidasDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  entrada_id: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  empleado_id: number;

  @IsDateString({ strict: true })
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  fecha_hora_salida: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  total_horas: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  monto_calculado: number;
}
