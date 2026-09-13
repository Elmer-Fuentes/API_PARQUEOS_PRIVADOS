import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearTarifasDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  sede_id: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  tipo_vehiculo_id: number;

  @IsString()
  @MaxLength(100)
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  nombre: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  precio_hora: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  precio_dia?: number;

  @IsBoolean()
  activo: boolean;
}
