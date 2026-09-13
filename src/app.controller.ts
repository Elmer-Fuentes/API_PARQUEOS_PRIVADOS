import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator.js';
import { DatabaseService } from './database/database.service.js';

@ApiTags('Sistema')
@Controller()
export class AppController {
  constructor(private readonly database: DatabaseService) {}

  @Public()
  @Get()
  inicio() {
    return {
      exito: true,
      mensaje: 'API REST Parqueo Privados GT funcionando.',
      swagger: '/api/docs',
      login: '/api/auth/login',
    };
  }

  @Public()
  @Get('health')
  health() {
    return this.database.probarConexion();
  }
}
