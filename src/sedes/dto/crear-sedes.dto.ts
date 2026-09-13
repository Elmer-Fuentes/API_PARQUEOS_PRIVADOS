import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CrearSedesDto {
  @IsString()
  @MaxLength(120)
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  nombre: string;

  @IsString()
  @MaxLength(250)
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  direccion: string;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  telefono?: string;

  @IsBoolean()
  activo: boolean;
}
