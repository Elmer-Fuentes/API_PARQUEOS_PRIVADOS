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

export class CrearEmpleadosDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  sede_id: number;

  @IsString()
  @MaxLength(150)
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  nombre: string;

  @IsString()
  @MaxLength(20)
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  dpi: string;

  @IsString()
  @MaxLength(80)
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  puesto: string;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  telefono?: string;

  @IsBoolean()
  activo: boolean;
}
