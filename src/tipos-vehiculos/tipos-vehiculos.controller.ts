import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TiposVehiculosService } from './tipos-vehiculos.service.js';
import { CrearTiposVehiculosDto } from './dto/crear-tipos-vehiculos.dto.js';
import { ActualizarTiposVehiculosDto } from './dto/actualizar-tipos-vehiculos.dto.js';

@ApiTags('tipos-vehiculos')
@ApiBearerAuth('session-jwt')
@Controller('tipos-vehiculos')
export class TiposVehiculosController {
  constructor(private readonly service: TiposVehiculosService) {}

  @Get('consultar')
  consultar() {
    return this.service.consultar();
  }

  @Get('buscar/:id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscar(id);
  }

  @Post('agregar')
  agregar(@Body() dto: CrearTiposVehiculosDto) {
    return this.service.agregar(dto);
  }

  @Put('editar/:id')
  editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarTiposVehiculosDto,
  ) {
    return this.service.editar(id, dto);
  }

  @Delete('eliminar/:id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}
