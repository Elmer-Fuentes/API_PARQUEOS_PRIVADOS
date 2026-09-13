import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CrearTiposVehiculosDto {
  @IsString()
  @MaxLength(80)
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;

  @IsBoolean()
  activo: boolean;
}
