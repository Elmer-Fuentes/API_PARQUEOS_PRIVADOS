import { Module } from '@nestjs/common';
import { VehiculosController } from './vehiculos.controller.js';
import { VehiculosService } from './vehiculos.service.js';
import { VehiculosRepository } from './vehiculos.repository.js';

@Module({
  controllers: [VehiculosController],
  providers: [VehiculosService, VehiculosRepository],
})
export class VehiculosModule {}
