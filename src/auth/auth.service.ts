import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isUUID } from 'class-validator';
import { scryptSync, timingSafeEqual, randomUUID } from 'node:crypto';
import { AuthRepository } from './auth.repository.js';
import { LoginDto } from './dto/login.dto.js';
import { duracionJwtEnMinutos } from './duracion-jwt.js';

/**
 * TokenPayload
 * ---------------------------------------------------------------------------
 * Autor: Elmer Fuentes
 *
 * Definición: forma del contenido (payload) que se firma dentro de CADA JWT
 * emitido por el sistema. El campo `tipo` indica qué clase de token es:
 *  - "login"   => es el REFRESH TOKEN. Vive 7 días. Solo sirve para llamar
 *                 a /auth/renovar-sesion y /auth/logout. NO da acceso al CRUD.
 *  - "session" => es el ACCESS TOKEN. Vive 15 segundos. Es el que se manda
 *                 en el header `Authorization: Bearer <accessToken>` para
 *                 consumir los endpoints protegidos (clientes, vehículos, etc).
 */
export interface TokenPayload {
  sub: number;
  usuario: string;
  nombre: string;
  tipo: 'login' | 'session';
  sesionId: string;
  jti: string;
  iat?: number;
  exp: number;
}

/**
 * AuthService
 * ---------------------------------------------------------------------------
 * Autor: Elmer Fuentes
 *
 * Definición: contiene toda la lógica de autenticación del sistema
 * (Parqueo Privados GT): login, verificación/validación de JWT, renovación
 * de sesión y logout.
 *
 * Glosario usado en todo este archivo:
 *  - accessToken  (payload.tipo = "session"): token de corta duración
 *    (15 segundos) que el cliente debe enviar en cada petición a un endpoint
 *    protegido. Aunque su `exp` de JWT venza, el guard de sesión
 *    (SessionJwtGuard) lo sigue aceptando mientras la sesión exista y esté
 *    vigente en la tabla `sesiones_usuario` (validación "deslizante" en BD).
 *  - refreshToken (payload.tipo = "login"): token de larga duración
 *    (7 días) que únicamente sirve para renovar la vigencia de la sesión
 *    (/auth/renovar-sesion) o cerrarla definitivamente (/auth/logout).
 *    Si el refreshToken vence o la sesión se cierra, el accessToken deja
 *    de ser válido de inmediato, sin importar su propio `exp`.
 */
@Injectable()
export class AuthService {
  /** Duración del refreshToken (tipo "login"), en minutos. Configurable con JWT_LOGIN_MINUTES (recomendado: "168h" = 7 días). */
  private readonly loginMinutes = duracionJwtEnMinutos(
    'JWT_LOGIN_MINUTES',
    process.env.JWT_LOGIN_MINUTES,
    480,
  );
  /** Duración del accessToken (tipo "session"), en minutos. Configurable con JWT_SESSION_MINUTES (recomendado: "15s" = 15 segundos). */
  private readonly sessionMinutes = duracionJwtEnMinutos(
    'JWT_SESSION_MINUTES',
    process.env.JWT_SESSION_MINUTES,
    30,
  );

  constructor(
    private readonly jwtService: JwtService,
    private readonly repository: AuthRepository,
  ) {}

  /**
   * validarPassword
   * Autor: Elmer Fuentes
   * Definición: compara una contraseña en texto plano contra el hash
   * almacenado (formato "salt:hashHex", generado con scrypt) usando
   * comparación de tiempo constante (timingSafeEqual) para evitar
   * ataques de temporización.
   * @param password    Contraseña ingresada por el usuario en el login.
   * @param almacenado  Valor "salt:hashHex" guardado en la base de datos.
   * @returns true si la contraseña coincide, false en caso contrario.
   */
  private validarPassword(password: string, almacenado: string) {
    const [salt, hashHex] = almacenado.split(':');
    if (!salt || !hashHex) return false;
    const esperado = Buffer.from(hashHex, 'hex');
    const actual = scryptSync(password, salt, esperado.length);
    return (
      esperado.length === actual.length && timingSafeEqual(esperado, actual)
    );
  }

  /**
   * minutosDesdeAhora
   * Autor: Elmer Fuentes
   * Definición: calcula la fecha/hora exacta que resulta de sumarle
   * `minutos` (puede ser fraccionario, ej. 0.25 = 15 segundos) al
   * momento actual. Se usa para fijar la expiración de un token o de
   * un registro de sesión en base de datos.
   * @param minutos Cantidad de minutos a sumar desde ahora.
   * @returns Fecha resultante.
   */
  private minutosDesdeAhora(minutos: number) {
    return new Date(Math.floor(Date.now() / 1000 + minutos * 60) * 1000);
  }

  /**
   * firmarToken
   * Autor: Elmer Fuentes
   * Definición: firma (crea) un JWT HS256 con el payload y la fecha de
   * expiración indicados. Es el método de bajo nivel que usa `login()`
   * para emitir tanto el accessToken (tipo "session") como el
   * refreshToken (tipo "login").
   * @param payload     Datos del usuario/sesión a incluir en el token (sin iat/exp).
   * @param expiracion  Fecha exacta en la que el token debe vencer.
   * @returns El JWT firmado, listo para enviar al cliente.
   */
  private async firmarToken(
    payload: Omit<TokenPayload, 'iat' | 'exp'>,
    expiracion: Date,
  ) {
    return this.jwtService.signAsync(
      { ...payload, exp: expiracion.getTime() / 1000 },
      {
        secret: process.env.JWT_SECRET || 'CAMBIAR_ESTE_SECRETO_EN_PRODUCCION',
        algorithm: 'HS256',
      },
    );
  }

  /**
   * login
   * Autor: Elmer Fuentes
   * Definición: valida usuario/contraseña, crea el registro de sesión en
   * la tabla `sesiones_usuario` y emite el PAR de tokens del sistema:
   *  - accessToken  (tipo "session"): dura 15 segundos. Se usa para
   *    consumir los endpoints CRUD protegidos.
   *  - refreshToken (tipo "login"): dura 7 días. Se usa únicamente para
   *    renovar la sesión (/auth/renovar-sesion) o cerrarla (/auth/logout).
   * La expiración real del accessToken nunca puede superar la del
   * refreshToken (se usa el menor de los dos con Math.min).
   * @param dto Credenciales del usuario (usuario + password).
   * @returns Objeto con `accessToken`, `refreshToken` y los datos del usuario.
   * @throws UnauthorizedException si el usuario no existe, está inactivo,
   *         la contraseña es incorrecta, o no se pudo crear la sesión.
   */
  async login(dto: LoginDto) {
    const usuario = await this.repository.buscarUsuario(dto.usuario.trim());
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    const passwordValido = this.validarPassword(
      dto.password,
      usuario.password_hash,
    );
    if (!passwordValido) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    const sesionId = randomUUID();
    const loginJti = randomUUID();
    const sessionJti = randomUUID();
    const expiracionLogin = this.minutosDesdeAhora(this.loginMinutes);
    const expiracionSesion = new Date(
      Math.min(
        this.minutosDesdeAhora(this.sessionMinutes).getTime(),
        expiracionLogin.getTime(),
      ),
    );

    const registro = await this.repository.crearSesion({
      sesionId,
      usuarioId: usuario.id,
      loginJti,
      sessionJti,
      expiracionLogin,
      expiracionSesion,
    });

    if (!registro?.exito) {
      throw new UnauthorizedException('No fue posible crear la sesión.');
    }

    const base = {
      sub: usuario.id,
      usuario: usuario.usuario,
      nombre: usuario.nombre,
      sesionId,
    };

    const [refreshToken, accessToken] = await Promise.all([
      this.firmarToken(
        { ...base, tipo: 'login', jti: loginJti },
        expiracionLogin,
      ),
      this.firmarToken(
        { ...base, tipo: 'session', jti: sessionJti },
        expiracionSesion,
      ),
    ]);

    return {
      exito: true,
      mensaje: 'Inicio de sesión correcto.',
      data: {
        usuario: {
          id: usuario.id,
          usuario: usuario.usuario,
          nombre: usuario.nombre,
        },
        accessToken,
        refreshToken,
        loginExpiraEnMinutos: this.loginMinutes,
        sessionExpiraEnMinutos: this.sessionMinutes,
      },
    };
  }

  /**
   * verificarToken
   * Autor: Elmer Fuentes
   * Definición: verifica la firma HS256 de un JWT (accessToken o
   * refreshToken) y valida la forma de su payload. Cuando
   * `permitirSesionVencida` es true (lo usa el SessionJwtGuard para el
   * accessToken), se ignora el `exp` propio del JWT porque la vigencia
   * real del accessToken la determina el registro en base de datos, no
   * el token en sí; esto es lo que permite que un accessToken de 15
   * segundos se siga aceptando mientras la sesión siga activa.
   * @param token                    JWT recibido en el header Authorization.
   * @param permitirSesionVencida    Si es true, no rechaza el token por `exp` vencido (solo válido para tipo "session").
   * @returns El payload decodificado y validado.
   * @throws UnauthorizedException si la firma es inválida, el formato del
   *         payload es incorrecto, o (para el refreshToken) ya venció.
   */
  async verificarToken(
    token: string,
    { permitirSesionVencida = false } = {},
  ): Promise<TokenPayload> {
    try {
      // El exp del accessToken es su plazo inicial. Solo el guard de sesión
      // permite superarlo, y siempre exige validar el login asociado en SQL.
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: process.env.JWT_SECRET || 'CAMBIAR_ESTE_SECRETO_EN_PRODUCCION',
        algorithms: ['HS256'],
        ignoreExpiration: permitirSesionVencida,
      });
      if (
        !Number.isInteger(payload.sub) ||
        payload.sub <= 0 ||
        !isUUID(payload.sesionId) ||
        !isUUID(payload.jti) ||
        !Number.isInteger(payload.exp) ||
        !['login', 'session'].includes(payload.tipo) ||
        (payload.tipo !== 'session' &&
          payload.exp <= Math.floor(Date.now() / 1000))
      ) {
        throw new Error('Contenido del token inválido.');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Token inválido o vencido.');
    }
  }

  /**
   * validarTokenSesion
   * Autor: Elmer Fuentes
   * Definición: valida en base de datos que el accessToken (tipo
   * "session") pertenezca a una sesión activa y no vencida. Si el
   * registro de sesión en BD sí venció, intenta extenderlo
   * automáticamente (renovación silenciosa) siempre que el refreshToken
   * asociado siga vigente.
   * @param payload Payload ya verificado del accessToken.
   * @returns true si el accessToken puede usarse para esta petición; false si no.
   */
  async validarTokenSesion(payload: TokenPayload) {
    if (payload.tipo !== 'session') return false;
    const vigente = await this.repository.validarSesion(
      payload.sesionId,
      payload.sub,
      payload.jti,
    );
    if (vigente) return true;
    return Boolean(
      await this.repository.mantenerSesion(
        payload.sesionId,
        payload.sub,
        payload.jti,
        'session',
        this.minutosDesdeAhora(this.sessionMinutes),
      ),
    );
  }

  /**
   * validarTokenLogin
   * Autor: Elmer Fuentes
   * Definición: valida en base de datos que el refreshToken (tipo
   * "login") corresponda a una sesión que sigue abierta (no se hizo
   * logout) y no ha vencido. Lo usa el LoginJwtGuard antes de permitir
   * /auth/renovar-sesion o /auth/logout.
   * @param payload Payload ya verificado del refreshToken.
   * @returns true si el refreshToken sigue siendo válido; false si no.
   */
  async validarTokenLogin(payload: TokenPayload) {
    if (payload.tipo !== 'login') return false;
    return this.repository.validarLogin(
      payload.sesionId,
      payload.sub,
      payload.jti,
    );
  }

  /**
   * renovarSesion
   * Autor: Elmer Fuentes
   * Definición: usando el refreshToken (tipo "login"), extiende la
   * vigencia de la sesión en base de datos por `sessionMinutes` (15
   * segundos) más, sin necesidad de que el usuario vuelva a escribir su
   * contraseña. IMPORTANTE: este método NO genera un accessToken nuevo;
   * el cliente sigue usando el MISMO accessToken que recibió en el
   * login — lo que cambia es la fecha de expiración de la sesión en BD.
   * Si el refreshToken ya venció o la sesión fue cerrada, no hay
   * renovación posible y el usuario debe iniciar sesión de nuevo.
   * @param payload Payload ya verificado del refreshToken.
   * @returns Datos de vigencia actualizados de la sesión (fechas de expiración).
   * @throws UnauthorizedException si el login no existe, venció o fue cerrado.
   */
  async renovarSesion(payload: TokenPayload) {
    const vigencia = await this.repository.mantenerSesion(
      payload.sesionId,
      payload.sub,
      payload.jti,
      'login',
      this.minutosDesdeAhora(this.sessionMinutes),
    );

    if (!vigencia) {
      throw new UnauthorizedException(
        'El login no existe, venció o fue cerrado.',
      );
    }

    return {
      exito: true,
      mensaje: 'Sesión activa. Continúe usando el mismo accessToken.',
      data: vigencia,
    };
  }

  /**
   * logout
   * Autor: Elmer Fuentes
   * Definición: cierra definitivamente la sesión (marca `activa=FALSE`
   * en `sesiones_usuario`). Al cerrarse la sesión, TANTO el accessToken
   * como el refreshToken quedan invalidados de inmediato: el
   * refreshToken porque `validarTokenLogin` ya no lo encontrará activo,
   * y el accessToken porque `validarTokenSesion` depende de esa misma
   * sesión para seguir siendo válido.
   * @param payload Payload ya verificado del refreshToken (requerido para hacer logout).
   * @returns Confirmación de que la sesión fue cerrada.
   * @throws UnauthorizedException si la sesión ya no estaba activa.
   */
  async logout(payload: TokenPayload) {
    const resultado = await this.repository.cerrarSesion(
      payload.sesionId,
      payload.sub,
      payload.jti,
    );
    if (!resultado?.exito) {
      throw new UnauthorizedException(
        resultado?.mensaje || 'La sesión ya no está activa.',
      );
    }
    return resultado;
  }
}
