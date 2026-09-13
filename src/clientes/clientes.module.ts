import { Module } from '@nestjs/common';
import { ClientesController } from './clientes.controller.js';
import { ClientesService } from './clientes.service.js';
import { ClientesRepository } from './clientes.repository.js';

@Module({
  controllers: [ClientesController],
  providers: [ClientesService, ClientesRepository],
})
export class ClientesModule {}
