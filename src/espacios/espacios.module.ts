import { Module } from '@nestjs/common';
import { EspaciosController } from './espacios.controller.js';
import { EspaciosService } from './espacios.service.js';
import { EspaciosRepository } from './espacios.repository.js';

@Module({
  controllers: [EspaciosController],
  providers: [EspaciosService, EspaciosRepository],
})
export class EspaciosModule {}
