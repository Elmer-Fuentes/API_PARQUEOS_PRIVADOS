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

export class CrearVehiculosDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  cliente_id: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  tipo_vehiculo_id: number;

  @IsString()
  @MaxLength(20)
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  placa: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  marca?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  modelo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  color?: string;

  @IsBoolean()
  activo: boolean;
}
