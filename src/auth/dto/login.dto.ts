import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  usuario: string;

  @ApiProperty({ example: 'Admin123*', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
