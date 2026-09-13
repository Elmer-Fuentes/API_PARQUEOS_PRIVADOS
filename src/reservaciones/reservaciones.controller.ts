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
import { ReservacionesService } from './reservaciones.service.js';
import { CrearReservacionesDto } from './dto/crear-reservaciones.dto.js';
import { ActualizarReservacionesDto } from './dto/actualizar-reservaciones.dto.js';

@ApiTags('reservaciones')
@ApiBearerAuth('session-jwt')
@Controller('reservaciones')
export class ReservacionesController {
  constructor(private readonly service: ReservacionesService) {}

  @Get('consultar')
  consultar() {
    return this.service.consultar();
  }

  @Get('buscar/:id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscar(id);
  }

  @Post('agregar')
  agregar(@Body() dto: CrearReservacionesDto) {
    return this.service.agregar(dto);
  }

  @Put('editar/:id')
  editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarReservacionesDto,
  ) {
    return this.service.editar(id, dto);
  }

  @Delete('eliminar/:id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}
