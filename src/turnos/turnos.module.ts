import { Module } from '@nestjs/common';
import { TurnosController } from './turnos.controller.js';
import { TurnosService } from './turnos.service.js';
import { TurnosRepository } from './turnos.repository.js';

@Module({
  controllers: [TurnosController],
  providers: [TurnosService, TurnosRepository],
})
export class TurnosModule {}
