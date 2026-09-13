import { Module } from '@nestjs/common';
import { EmpleadosController } from './empleados.controller.js';
import { EmpleadosService } from './empleados.service.js';
import { EmpleadosRepository } from './empleados.repository.js';

@Module({
  controllers: [EmpleadosController],
  providers: [EmpleadosService, EmpleadosRepository],
})
export class EmpleadosModule {}
