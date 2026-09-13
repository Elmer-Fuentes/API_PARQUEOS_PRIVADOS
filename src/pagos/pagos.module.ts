import { Module } from '@nestjs/common';
import { PagosController } from './pagos.controller.js';
import { PagosService } from './pagos.service.js';
import { PagosRepository } from './pagos.repository.js';

@Module({
  controllers: [PagosController],
  providers: [PagosService, PagosRepository],
})
export class PagosModule {}
