import { Module } from '@nestjs/common';
import { SedesController } from './sedes.controller.js';
import { SedesService } from './sedes.service.js';
import { SedesRepository } from './sedes.repository.js';

@Module({
  controllers: [SedesController],
  providers: [SedesService, SedesRepository],
})
export class SedesModule {}
