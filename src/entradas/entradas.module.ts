import { Module } from '@nestjs/common';
import { EntradasController } from './entradas.controller.js';
import { EntradasService } from './entradas.service.js';
import { EntradasRepository } from './entradas.repository.js';

@Module({
  controllers: [EntradasController],
  providers: [EntradasService, EntradasRepository],
})
export class EntradasModule {}
