import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { SessionJwtGuard } from './auth/guards/session-jwt.guard.js';
import { DatabaseModule } from './database/database.module.js';
import { SedesModule } from './sedes/sedes.module.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { TiposVehiculosModule } from './tipos-vehiculos/tipos-vehiculos.module.js';
import { VehiculosModule } from './vehiculos/vehiculos.module.js';
import { TarifasModule } from './tarifas/tarifas.module.js';
import { EspaciosModule } from './espacios/espacios.module.js';
import { EmpleadosModule } from './empleados/empleados.module.js';
import { TurnosModule } from './turnos/turnos.module.js';
import { ReservacionesModule } from './reservaciones/reservaciones.module.js';
import { EntradasModule } from './entradas/entradas.module.js';
import { SalidasModule } from './salidas/salidas.module.js';
import { PagosModule } from './pagos/pagos.module.js';
import { IncidenciasModule } from './incidencias/incidencias.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    SedesModule,
    ClientesModule,
    TiposVehiculosModule,
    VehiculosModule,
    TarifasModule,
    EspaciosModule,
    EmpleadosModule,
    TurnosModule,
    ReservacionesModule,
    EntradasModule,
    SalidasModule,
    PagosModule,
    IncidenciasModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SessionJwtGuard,
    },
  ],
})
export class AppModule {}
