import { Module } from '@nestjs/common';
import { SalidasController } from './salidas.controller.js';
import { SalidasService } from './salidas.service.js';
import { SalidasRepository } from './salidas.repository.js';

@Module({
  controllers: [SalidasController],
  providers: [SalidasService, SalidasRepository],
})
export class SalidasModule {}
