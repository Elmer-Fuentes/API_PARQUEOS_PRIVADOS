import { Module } from '@nestjs/common';
import { TarifasController } from './tarifas.controller.js';
import { TarifasService } from './tarifas.service.js';
import { TarifasRepository } from './tarifas.repository.js';

@Module({
  controllers: [TarifasController],
  providers: [TarifasService, TarifasRepository],
})
export class TarifasModule {}
