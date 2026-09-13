import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearEntradasDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  vehiculo_id: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  espacio_id: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  empleado_id: number;

  @IsDateString({ strict: true })
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  fecha_hora_entrada: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  observacion?: string;
}
