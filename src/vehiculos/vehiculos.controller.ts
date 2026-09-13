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
import { VehiculosService } from './vehiculos.service.js';
import { CrearVehiculosDto } from './dto/crear-vehiculos.dto.js';
import { ActualizarVehiculosDto } from './dto/actualizar-vehiculos.dto.js';

@ApiTags('vehiculos')
@ApiBearerAuth('session-jwt')
@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly service: VehiculosService) {}

  @Get('consultar')
  consultar() {
    return this.service.consultar();
  }

  @Get('buscar/:id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscar(id);
  }

  @Post('agregar')
  agregar(@Body() dto: CrearVehiculosDto) {
    return this.service.agregar(dto);
  }

  @Put('editar/:id')
  editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarVehiculosDto,
  ) {
    return this.service.editar(id, dto);
  }

  @Delete('eliminar/:id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}
