import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, type TokenPayload } from '../auth.service.js';

export interface RequestConLogin extends Request {
  usuarioLogin?: TokenPayload;
}

/**
 * LoginJwtGuard
 * ---------------------------------------------------------------------------
 * Autor: Elmer Fuentes
 *
 * Definición: protege los endpoints que solo aceptan el REFRESH TOKEN
 * (payload.tipo = "login", duración 7 días): /auth/renovar-sesion y
 * /auth/logout. Rechaza cualquier accessToken (tipo "session") que se
 * intente usar en estas rutas.
 */
@Injectable()
export class LoginJwtGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  /**
   * canActivate
   * Autor: Elmer Fuentes
   * Definición: extrae el Bearer token del header Authorization, verifica
   * su firma, confirma que sea de tipo "login" (refreshToken) y que la
   * sesión asociada siga activa en base de datos.
   * @param context Contexto de ejecución de NestJS (contiene el Request).
   * @returns true si el refreshToken es válido; lanza excepción si no.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestConLogin>();
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Se requiere token JWT de login.');
    }

    const payload = await this.authService.verificarToken(token);
    if (payload.tipo !== 'login') {
      throw new UnauthorizedException(
        'Se requiere el refreshToken para renovar o cerrar sesión.',
      );
    }
    const valido = await this.authService.validarTokenLogin(payload);
    if (!valido) {
      throw new UnauthorizedException(
        'El login no existe, venció o fue cerrado.',
      );
    }

    request.usuarioLogin = payload;
    return true;
  }
}
