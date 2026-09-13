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
import { EmpleadosService } from './empleados.service.js';
import { CrearEmpleadosDto } from './dto/crear-empleados.dto.js';
import { ActualizarEmpleadosDto } from './dto/actualizar-empleados.dto.js';

@ApiTags('empleados')
@ApiBearerAuth('session-jwt')
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly service: EmpleadosService) {}

  @Get('consultar')
  consultar() {
    return this.service.consultar();
  }

  @Get('buscar/:id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscar(id);
  }

  @Post('agregar')
  agregar(@Body() dto: CrearEmpleadosDto) {
    return this.service.agregar(dto);
  }

  @Put('editar/:id')
  editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEmpleadosDto,
  ) {
    return this.service.editar(id, dto);
  }

  @Delete('eliminar/:id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}
