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
import { IncidenciasService } from './incidencias.service.js';
import { CrearIncidenciasDto } from './dto/crear-incidencias.dto.js';
import { ActualizarIncidenciasDto } from './dto/actualizar-incidencias.dto.js';

@ApiTags('incidencias')
@ApiBearerAuth('session-jwt')
@Controller('incidencias')
export class IncidenciasController {
  constructor(private readonly service: IncidenciasService) {}

  @Get('consultar')
  consultar() {
    return this.service.consultar();
  }

  @Get('buscar/:id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscar(id);
  }

  @Post('agregar')
  agregar(@Body() dto: CrearIncidenciasDto) {
    return this.service.agregar(dto);
  }

  @Put('editar/:id')
  editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarIncidenciasDto,
  ) {
    return this.service.editar(id, dto);
  }

  @Delete('eliminar/:id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}
