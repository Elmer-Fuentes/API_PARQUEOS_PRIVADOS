import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearEspaciosDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  sede_id: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  tipo_vehiculo_id: number;

  @IsString()
  @MaxLength(30)
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  codigo: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  nivel?: string;

  @IsString()
  @MaxLength(20)
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  estado: string;

  @IsBoolean()
  activo: boolean;
}
