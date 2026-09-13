/**
 * types/auth.ts
 * -----------------------------------------------------------------------
 * Autor: Elmer Fuentes
 *
 * Definiciones de tipos para el módulo de autenticación del frontend.
 *
 * Glosario (debe coincidir exactamente con lo que entrega el backend):
 *  - accessToken  : JWT de corta duración (15 segundos). Se envía como
 *                    `Authorization: Bearer <accessToken>` en cada
 *                    petición a un endpoint protegido (CRUD). NO se
 *                    reemplaza por uno nuevo al renovar la sesión: el
 *                    mismo accessToken se sigue usando mientras la
 *                    sesión exista, porque el backend valida su vigencia
 *                    real contra la base de datos (no contra el `exp`
 *                    propio del JWT).
 *  - refreshToken : JWT de larga duración (7 días). Solo sirve para
 *                    llamar a /auth/renovar-sesion o /auth/logout. Si
 *                    vence o se cierra la sesión, el accessToken deja de
 *                    servir de inmediato, sin importar su propio `exp`.
 */

export interface Usuario {
  id: number;
  usuario: string;
  nombre: string;
}

/** Definición: datos que entrega POST /auth/login. */
export interface LoginData {
  usuario: Usuario;
  /** JWT de 7 días. Solo para renovar-sesion / logout. */
  refreshToken: string;
  /** JWT de 15 segundos. Para consumir el CRUD. */
  accessToken: string;
  /** Duración del refreshToken, en minutos (informativo). */
  loginExpiraEnMinutos: number;
  /** Duración del accessToken, en minutos (informativo). */
  sessionExpiraEnMinutos: number;
}

export interface LoginResponse {
  exito: boolean;
  mensaje: string;
  data: LoginData;
}

/**
 * Definición: datos que entrega POST /auth/renovar-sesion.
 * OJO: el backend NO emite un accessToken nuevo aquí; solo extiende la
 * fecha de expiración de la sesión en base de datos. Por eso este tipo
 * no incluye ningún campo de token, solo las fechas de vigencia.
 */
export interface RenewData {
  sesionId: string;
  /** Nueva fecha (ISO) hasta la que el accessToken seguirá siendo válido. */
  sessionExpiraEn: string;
  /** Fecha (ISO) hasta la que el refreshToken sigue siendo válido. */
  loginExpiraEn: string;
}

export interface RenewResponse {
  exito: boolean;
  mensaje: string;
  data: RenewData;
}

export interface JwtPayload {
  sub?: number;
  usuario?: string;
  nombre?: string;
  /** 'login' = refreshToken (7 días) | 'session' = accessToken (15s) */
  tipo?: 'login' | 'session';
  sesionId?: string;
  jti?: string;
  iat?: number;
  exp?: number;
}
