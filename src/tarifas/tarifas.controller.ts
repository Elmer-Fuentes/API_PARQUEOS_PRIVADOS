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
import { TarifasService } from './tarifas.service.js';
import { CrearTarifasDto } from './dto/crear-tarifas.dto.js';
import { ActualizarTarifasDto } from './dto/actualizar-tarifas.dto.js';

@ApiTags('tarifas')
@ApiBearerAuth('session-jwt')
@Controller('tarifas')
export class TarifasController {
  constructor(private readonly service: TarifasService) {}

  @Get('consultar')
  consultar() {
    return this.service.consultar();
  }

  @Get('buscar/:id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscar(id);
  }

  @Post('agregar')
  agregar(@Body() dto: CrearTarifasDto) {
    return this.service.agregar(dto);
  }

  @Put('editar/:id')
  editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarTarifasDto,
  ) {
    return this.service.editar(id, dto);
  }

  @Delete('eliminar/:id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}
