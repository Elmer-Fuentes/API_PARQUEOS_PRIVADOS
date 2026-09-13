import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthService, type TokenPayload } from '../auth.service.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

export interface RequestConUsuario extends Request {
  usuario?: TokenPayload;
}

/**
 * SessionJwtGuard
 * ---------------------------------------------------------------------------
 * Autor: Elmer Fuentes
 *
 * Definición: guard GLOBAL (registrado en app.module.ts) que protege todos
 * los endpoints del CRUD (sedes, clientes, vehículos, etc.) exigiendo el
 * ACCESS TOKEN (payload.tipo = "session", duración 15 segundos), excepto
 * las rutas marcadas con @Public(). Aunque el `exp` propio del JWT haya
 * vencido, el guard lo sigue aceptando si la sesión asociada continúa
 * activa en base de datos (ver AuthService.verificarToken /
 * validarTokenSesion) — así se logra que un accessToken de vida tan
 * corta (15s) no obligue a pedir uno nuevo en cada request.
 */
@Injectable()
export class SessionJwtGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  /**
   * canActivate
   * Autor: Elmer Fuentes
   * Definición: si la ruta es pública, deja pasar sin validar token.
   * Si no lo es, extrae el Bearer token, verifica su firma (permitiendo
   * que el `exp` ya esté vencido), confirma que sea de tipo "session"
   * (accessToken) y que la sesión siga vigente en base de datos.
   * @param context Contexto de ejecución de NestJS (contiene el Request).
   * @returns true si el accessToken es válido o la ruta es pública; lanza excepción si no.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestConUsuario>();
    const token = this.extraerBearer(request);
    if (!token) {
      throw new UnauthorizedException('Se requiere token JWT de sesión.');
    }

    const payload = await this.authService.verificarToken(token, {
      permitirSesionVencida: true,
    });
    if (payload.tipo !== 'session') {
      throw new UnauthorizedException(
        'Se requiere el accessToken. El refreshToken solo permite renovar o cerrar sesión.',
      );
    }
    const valido = await this.authService.validarTokenSesion(payload);
    if (!valido) {
      throw new UnauthorizedException(
        'La sesión no existe, el login venció o fue cerrado.',
      );
    }

    request.usuario = payload;
    return true;
  }

  /**
   * extraerBearer
   * Autor: Elmer Fuentes
   * Definición: obtiene el token del header `Authorization: Bearer <token>`.
   * @param request Request HTTP entrante.
   * @returns El token si el header viene bien formado; undefined si no.
   */
  private extraerBearer(request: Request) {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}
