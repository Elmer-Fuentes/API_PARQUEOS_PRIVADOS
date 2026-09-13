import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

export interface UsuarioAuth {
  id: number;
  usuario: string;
  nombre: string;
  password_hash: string;
  activo: boolean;
}

export interface VigenciaSesion {
  sesionId: string;
  sessionExpiraEn: Date;
  loginExpiraEn: Date;
}

/**
 * AuthRepository
 * ---------------------------------------------------------------------------
 * Autor: Elmer Fuentes
 *
 * Definición: acceso a datos (PostgreSQL) para todo lo relacionado con
 * autenticación y sesiones. La tabla `sesiones_usuario` es la fuente de
 * verdad de la vigencia real de accessToken/refreshToken: cada fila
 * guarda `fecha_expiracion_login` (vence el refreshToken) y
 * `fecha_expiracion_sesion` (vence el accessToken).
 */
@Injectable()
export class AuthRepository {
  constructor(private readonly db: DatabaseService) {}

  /**
   * buscarUsuario
   * Autor: Elmer Fuentes
   * Definición: busca un usuario por su nombre de usuario mediante el
   * stored procedure `sp_auth_usuario_buscar`.
   * @param usuario Nombre de usuario a buscar.
   * @returns Los datos del usuario (incluye hash de password) o null si no existe.
   */
  async buscarUsuario(usuario: string): Promise<UsuarioAuth | null> {
    const r = await this.db.query(
      'SELECT sp_auth_usuario_buscar($1) AS resultado',
      [usuario],
    );
    const resultado = r.rows[0]?.resultado;
    return resultado?.exito ? resultado.data : null;
  }

  /**
   * crearSesion
   * Autor: Elmer Fuentes
   * Definición: inserta el registro de sesión en `sesiones_usuario` al
   * momento del login, guardando el JTI y fecha de expiración tanto del
   * refreshToken (login) como del accessToken (session).
   * @param data Identificadores de la sesión y sus fechas de expiración.
   * @returns { exito: boolean } indicando si se creó correctamente.
   */
  async crearSesion(data: {
    sesionId: string;
    usuarioId: number;
    loginJti: string;
    sessionJti: string;
    expiracionLogin: Date;
    expiracionSesion: Date;
  }) {
    // Las funciones existentes reciben TIMESTAMP sin zona. Convertimos el
    // instante UTC a la zona de PostgreSQL antes de quitar el desplazamiento;
    // enviar Date directamente pierde la zona local de Node al guardar la fecha.
    const r = await this.db.query(
      `INSERT INTO sesiones_usuario
        (sesion_id,usuario_id,login_jti,session_jti,fecha_expiracion_login,fecha_expiracion_sesion)
       VALUES ($1,$2,$3,$4,
        $5::timestamptz AT TIME ZONE current_setting('TimeZone'),
        $6::timestamptz AT TIME ZONE current_setting('TimeZone'))
       RETURNING sesion_id`,
      [
        data.sesionId,
        data.usuarioId,
        data.loginJti,
        data.sessionJti,
        data.expiracionLogin.toISOString(),
        data.expiracionSesion.toISOString(),
      ],
    );
    return { exito: Boolean(r.rows[0]) };
  }

  /**
   * validarSesion
   * Autor: Elmer Fuentes
   * Definición: verifica en BD (sp_auth_sesion_validar) que el
   * accessToken (identificado por su JTI) corresponda a una sesión
   * activa y con `fecha_expiracion_sesion` aún no vencida.
   * @param sesionId    Identificador de la sesión (payload.sesionId).
   * @param usuarioId   Id del usuario dueño de la sesión.
   * @param sessionJti  JTI del accessToken.
   * @returns true si el accessToken sigue siendo válido.
   */
  async validarSesion(
    sesionId: string,
    usuarioId: number,
    sessionJti: string,
  ): Promise<boolean> {
    const r = await this.db.query(
      'SELECT sp_auth_sesion_validar($1,$2,$3) AS resultado',
      [sesionId, usuarioId, sessionJti],
    );
    return Boolean(r.rows[0]?.resultado?.exito);
  }

  /**
   * validarLogin
   * Autor: Elmer Fuentes
   * Definición: verifica en BD (sp_auth_login_validar) que el
   * refreshToken (identificado por su JTI) corresponda a una sesión
   * activa y con `fecha_expiracion_login` aún no vencida.
   * @param sesionId  Identificador de la sesión (payload.sesionId).
   * @param usuarioId Id del usuario dueño de la sesión.
   * @param loginJti  JTI del refreshToken.
   * @returns true si el refreshToken sigue siendo válido.
   */
  async validarLogin(
    sesionId: string,
    usuarioId: number,
    loginJti: string,
  ): Promise<boolean> {
    const r = await this.db.query(
      'SELECT sp_auth_login_validar($1,$2,$3) AS resultado',
      [sesionId, usuarioId, loginJti],
    );
    return Boolean(r.rows[0]?.resultado?.exito);
  }

  /**
   * mantenerSesion
   * Autor: Elmer Fuentes
   * Definición: extiende (renueva) la fecha de expiración del
   * accessToken en BD, de forma atómica, solo si el refreshToken (login)
   * asociado sigue vigente y activo. Nunca extiende la sesión más allá
   * de `fecha_expiracion_login` (el accessToken jamás puede durar más
   * que el refreshToken). Se usa tanto para la renovación explícita
   * (/auth/renovar-sesion) como para la renovación silenciosa dentro de
   * SessionJwtGuard.
   * @param sesionId          Identificador de la sesión.
   * @param usuarioId         Id del usuario dueño de la sesión.
   * @param tokenJti          JTI del token que está pidiendo la renovación.
   * @param tipo              'login' si se renueva con el refreshToken, 'session' si se renueva con el accessToken.
   * @param expiracionSesion  Nueva fecha propuesta de expiración del accessToken.
   * @returns Las fechas de vigencia actualizadas, o null si no se pudo renovar.
   */
  async mantenerSesion(
    sesionId: string,
    usuarioId: number,
    tokenJti: string,
    tipo: 'login' | 'session',
    expiracionSesion: Date,
  ): Promise<VigenciaSesion | null> {
    // Validación y extensión atómicas: conservar el JTI y no reactivar un login
    // cerrado/vencido, incluso si logout ocurre junto con la renovación.
    const r = await this.db.query<VigenciaSesion>(
      `UPDATE sesiones_usuario
       SET fecha_expiracion_sesion = CASE
         WHEN fecha_expiracion_sesion <= CURRENT_TIMESTAMP THEN
           LEAST($5::timestamptz AT TIME ZONE current_setting('TimeZone'), fecha_expiracion_login)
         ELSE fecha_expiracion_sesion
       END
       WHERE sesion_id=$1 AND usuario_id=$2 AND activa=TRUE
         AND fecha_expiracion_login > CURRENT_TIMESTAMP
         AND (($4::text='session' AND session_jti=$3::uuid)
           OR ($4::text='login' AND login_jti=$3::uuid))
       RETURNING sesion_id AS "sesionId",
         fecha_expiracion_sesion AT TIME ZONE current_setting('TimeZone') AS "sessionExpiraEn",
         fecha_expiracion_login AT TIME ZONE current_setting('TimeZone') AS "loginExpiraEn"`,
      [sesionId, usuarioId, tokenJti, tipo, expiracionSesion.toISOString()],
    );
    return r.rows[0] ?? null;
  }

  /**
   * cerrarSesion
   * Autor: Elmer Fuentes
   * Definición: marca la sesión como inactiva (`activa=FALSE`) en BD.
   * Esto invalida INMEDIATAMENTE tanto el accessToken como el
   * refreshToken de esa sesión, sin importar cuánto tiempo les quedara
   * de vigencia.
   * @param sesionId  Identificador de la sesión a cerrar.
   * @param usuarioId Id del usuario dueño de la sesión.
   * @param loginJti  JTI del refreshToken (se exige para autorizar el cierre).
   * @returns { exito, mensaje, data } con el resultado del logout.
   */
  async cerrarSesion(sesionId: string, usuarioId: number, loginJti: string) {
    const r = await this.db.query(
      `UPDATE sesiones_usuario SET activa=FALSE, fecha_cierre=CURRENT_TIMESTAMP
       WHERE sesion_id=$1 AND usuario_id=$2 AND activa=TRUE
         AND login_jti=$3::uuid AND fecha_expiracion_login > CURRENT_TIMESTAMP
       RETURNING sesion_id`,
      [sesionId, usuarioId, loginJti],
    );
    return { exito: r.rows.length > 0, mensaje: r.rows.length ? 'Sesión cerrada. Todos los tokens quedaron invalidados.' : 'La sesión ya no está disponible.', data: null };
  }
}
