import { Module } from '@nestjs/common';
import { IncidenciasController } from './incidencias.controller.js';
import { IncidenciasService } from './incidencias.service.js';
import { IncidenciasRepository } from './incidencias.repository.js';

@Module({
  controllers: [IncidenciasController],
  providers: [IncidenciasService, IncidenciasRepository],
})
export class IncidenciasModule {}
