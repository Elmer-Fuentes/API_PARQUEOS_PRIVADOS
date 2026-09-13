import { Module } from '@nestjs/common';
import { ReservacionesController } from './reservaciones.controller.js';
import { ReservacionesService } from './reservaciones.service.js';
import { ReservacionesRepository } from './reservaciones.repository.js';

@Module({
  controllers: [ReservacionesController],
  providers: [ReservacionesService, ReservacionesRepository],
})
export class ReservacionesModule {}
