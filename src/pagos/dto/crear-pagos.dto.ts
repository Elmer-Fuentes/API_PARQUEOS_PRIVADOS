import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearPagosDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  salida_id: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  cliente_id: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  monto: number;

  @IsString()
  @MaxLength(40)
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  metodo_pago: string;

  @IsDateString({ strict: true })
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  fecha_pago: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referencia?: string;

  @IsString()
  @MaxLength(20)
  @Matches(/\S/, { message: '$property no puede estar vacio' })
  estado: string;
}
