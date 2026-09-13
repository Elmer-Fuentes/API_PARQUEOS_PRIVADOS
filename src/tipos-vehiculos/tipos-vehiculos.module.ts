import { Module } from '@nestjs/common';
import { TiposVehiculosController } from './tipos-vehiculos.controller.js';
import { TiposVehiculosService } from './tipos-vehiculos.service.js';
import { TiposVehiculosRepository } from './tipos-vehiculos.repository.js';

@Module({
  controllers: [TiposVehiculosController],
  providers: [TiposVehiculosService, TiposVehiculosRepository],
})
export class TiposVehiculosModule {}
