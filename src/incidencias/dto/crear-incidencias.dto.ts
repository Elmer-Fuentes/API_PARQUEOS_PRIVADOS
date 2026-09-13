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

export class CrearIncidenciasDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  sede_id: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  empleado_id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2147483647)
  vehiculo_id?: number;

  @IsString()
  @MaxLength(80)
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  tipo: string;

  @IsString()
  @MaxLength(500)
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  descripcion: string;

  @IsDateString({ strict: true })
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  fecha_hora: string;

  @IsString()
  @MaxLength(20)
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  estado: string;
}
