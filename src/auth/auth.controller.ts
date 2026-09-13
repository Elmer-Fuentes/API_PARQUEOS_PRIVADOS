import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import {
  LoginJwtGuard,
  type RequestConLogin,
} from './guards/login-jwt.guard.js';

/**
 * AuthController
 * ---------------------------------------------------------------------------
 * Autor: Elmer Fuentes
 *
 * Definición: expone los endpoints HTTP de autenticación del sistema
 * Parqueo Privados GT.
 *  - POST /auth/login            -> público. Entrega accessToken (15s) + refreshToken (7 días).
 *  - POST /auth/renovar-sesion   -> requiere refreshToken. Extiende la sesión.
 *  - POST /auth/logout           -> requiere refreshToken. Cierra la sesión (invalida ambos tokens).
 */
@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  /**
   * login
   * Autor: Elmer Fuentes
   * Definición: recibe usuario y contraseña; si son correctos, crea la
   * sesión y responde con el accessToken (dura 15 segundos, para el
   * CRUD) y el refreshToken (dura 7 días, para renovar/cerrar sesión).
   * @param dto Credenciales enviadas en el body (usuario, password).
   */
  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Inicia sesión y entrega accessToken (15s) + refreshToken (7 días)',
  })
  login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  /**
   * renovar
   * Autor: Elmer Fuentes
   * Definición: recibe el refreshToken en el header Authorization y
   * extiende la vigencia de la sesión en base de datos. El accessToken
   * NO cambia; el cliente sigue usando el mismo que recibió en el login.
   * @param req Request con `usuarioLogin` inyectado por LoginJwtGuard (payload del refreshToken).
   */
  @Public()
  @UseGuards(LoginJwtGuard)
  @ApiBearerAuth('login-jwt')
  @Post('renovar-sesion')
  @ApiOperation({
    summary:
      'Comprueba la sesión y amplía su plazo si venció, conservando el mismo accessToken',
    description:
      'Use el refreshToken. Solo mantiene la sesión mientras el login siga vigente; devuelve las fechas de vigencia sin emitir tokens nuevos.',
  })
  renovar(@Req() req: RequestConLogin) {
    return this.service.renovarSesion(req.usuarioLogin!);
  }

  /**
   * logout
   * Autor: Elmer Fuentes
   * Definición: recibe el refreshToken en el header Authorization y
   * cierra la sesión de forma definitiva. A partir de este momento,
   * tanto el accessToken como el refreshToken quedan inválidos, sin
   * importar cuánto tiempo les faltara para vencer.
   * @param req Request con `usuarioLogin` inyectado por LoginJwtGuard (payload del refreshToken).
   */
  @Public()
  @UseGuards(LoginJwtGuard)
  @ApiBearerAuth('login-jwt')
  @Post('logout')
  @ApiOperation({
    summary: 'Cierra el login e invalida inmediatamente el accessToken y el refreshToken',
  })
  logout(@Req() req: RequestConLogin) {
    return this.service.logout(req.usuarioLogin!);
  }
}
