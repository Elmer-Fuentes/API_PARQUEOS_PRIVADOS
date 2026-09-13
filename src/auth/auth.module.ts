import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { LoginJwtGuard } from './guards/login-jwt.guard.js';
import { SessionJwtGuard } from './guards/session-jwt.guard.js';

@Global()
@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, LoginJwtGuard, SessionJwtGuard],
  exports: [AuthService, SessionJwtGuard],
})
export class AuthModule {}
