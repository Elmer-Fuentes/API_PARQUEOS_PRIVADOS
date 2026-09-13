import type { JwtPayload, LoginData, LoginResponse, RenewResponse, Usuario } from '../types/auth';

/**
 * authService.ts
 * -----------------------------------------------------------------------
 * Autor: Elmer Fuentes
 *
 * Definición: capa de acceso a la API de autenticación de Parqueo
 * Privados GT (login, renovación de sesión, logout) y utilidades para
 * leer/guardar los tokens en el navegador.
 *
 * Glosario:
 *  - accessToken  : token de 15 segundos, para los endpoints CRUD.
 *  - refreshToken : token de 7 días, para renovar o cerrar la sesión.
 *
 * IMPORTANTE (corrección de un bug de este archivo): el backend siempre
 * responde con los campos `accessToken` y `refreshToken` (nunca
 * `loginToken`/`sessionToken`). Este archivo debe usar esos mismos
 * nombres; de lo contrario el login parece exitoso en el backend pero
 * el frontend nunca guarda los tokens.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '');

/** Claves usadas en localStorage para persistir la sesión del navegador. */
const KEYS = {
  refresh: 'parqueo_refresh_token',
  access: 'parqueo_access_token',
  user: 'parqueo_user'
} as const;

/**
 * ApiError
 * Autor: Elmer Fuentes
 * Definición: error tipado que representa una respuesta no exitosa de
 * la API (incluye el status HTTP y el body ya parseado, cuando existe).
 */
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status = 0, body: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * parseResponse
 * Autor: Elmer Fuentes
 * Definición: lee el body de una Response como texto, intenta parsearlo
 * como JSON y, si la respuesta HTTP no fue exitosa (status fuera de
 * 200-299), lanza un ApiError con el mensaje del backend.
 * @param response Respuesta cruda de fetch().
 * @returns El body ya parseado y tipado como T.
 */
async function parseResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  let body: any = null;

  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    body = { message: raw || 'Respuesta no válida.' };
  }

  if (!response.ok) {
    const msg = Array.isArray(body?.message)
      ? body.message.join(' | ')
      : body?.message || body?.mensaje || `HTTP ${response.status}`;
    throw new ApiError(msg, response.status, body);
  }

  return body as T;
}

/**
 * saveLogin
 * Autor: Elmer Fuentes
 * Definición: guarda en localStorage el accessToken, el refreshToken y
 * los datos del usuario recibidos al iniciar sesión.
 * @param data Bloque `data` de la respuesta de /auth/login.
 */
function saveLogin(data: LoginData) {
  localStorage.setItem(KEYS.refresh, data.refreshToken);
  localStorage.setItem(KEYS.access, data.accessToken);
  localStorage.setItem(KEYS.user, JSON.stringify(data.usuario));
}

/**
 * clearAuth
 * Autor: Elmer Fuentes
 * Definición: borra de localStorage el accessToken, el refreshToken y
 * el usuario. Se usa al cerrar sesión o cuando la sesión ya no es válida.
 */
export function clearAuth() {
  localStorage.removeItem(KEYS.refresh);
  localStorage.removeItem(KEYS.access);
  localStorage.removeItem(KEYS.user);
}

/**
 * getRefreshToken
 * Autor: Elmer Fuentes
 * Definición: obtiene el refreshToken (7 días) guardado en localStorage.
 * @returns El refreshToken o null si no hay sesión.
 */
export function getRefreshToken() {
  return localStorage.getItem(KEYS.refresh);
}

/**
 * getAccessToken
 * Autor: Elmer Fuentes
 * Definición: obtiene el accessToken (15 segundos) guardado en
 * localStorage. Es el mismo token desde el login hasta el logout: no se
 * reemplaza al renovar la sesión.
 * @returns El accessToken o null si no hay sesión.
 */
export function getAccessToken() {
  return localStorage.getItem(KEYS.access);
}

/**
 * getUser
 * Autor: Elmer Fuentes
 * Definición: obtiene los datos del usuario autenticado guardados en
 * localStorage.
 * @returns El usuario o null si no hay sesión o el dato está corrupto.
 */
export function getUser(): Usuario | null {
  try {
    const raw = localStorage.getItem(KEYS.user);
    return raw ? JSON.parse(raw) as Usuario : null;
  } catch {
    return null;
  }
}

/**
 * decodeJwt
 * Autor: Elmer Fuentes
 * Definición: decodifica (sin verificar firma) el payload de un JWT,
 * solo para poder mostrar en pantalla su contenido (tipo, exp, etc).
 * La verificación real de firma y vigencia siempre ocurre en el backend.
 * @param token JWT completo (o null).
 * @returns El payload decodificado, o null si no se pudo decodificar.
 */
export function decodeJwt(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * tokenExpired
 * Autor: Elmer Fuentes
 * Definición: indica si un JWT ya venció (o está a punto de vencer,
 * usando `marginSeconds` como margen de seguridad), según su propio
 * campo `exp`. Nota: para el accessToken esto es solo informativo en el
 * frontend — el backend igual lo puede seguir aceptando si la sesión
 * sigue activa en base de datos (ver SessionJwtGuard).
 * @param token         JWT a evaluar (o null).
 * @param marginSeconds Segundos de margen antes del `exp` real.
 * @returns true si el token ya venció (o está por vencer).
 */
export function tokenExpired(token: string | null, marginSeconds = 0) {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now() + marginSeconds * 1000;
}

/**
 * isAuthenticated
 * Autor: Elmer Fuentes
 * Definición: indica si hay una sesión utilizable en el navegador:
 * existen accessToken, refreshToken y usuario guardados, y el
 * refreshToken (el que realmente determina si la sesión sigue viva
 * durante 7 días) todavía no venció.
 * @returns true si hay sesión activa desde el punto de vista del frontend.
 */
export function isAuthenticated() {
  return Boolean(getRefreshToken() && getAccessToken() && getUser() && !tokenExpired(getRefreshToken()));
}

/**
 * login
 * Autor: Elmer Fuentes
 * Definición: llama a POST /auth/login con usuario y contraseña. Si es
 * exitoso, guarda el accessToken (15s) y el refreshToken (7 días) en
 * localStorage.
 * @param usuario  Nombre de usuario.
 * @param password Contraseña en texto plano (viaja por HTTPS en producción).
 * @returns La respuesta completa del backend.
 * @throws ApiError si las credenciales son incorrectas o el backend no
 *         devolvió los tokens esperados.
 */
export async function login(usuario: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ usuario, password })
  });

  const body = await parseResponse<LoginResponse>(response);
  if (!body?.exito || !body?.data?.accessToken || !body?.data?.refreshToken) {
    throw new ApiError(body?.mensaje || 'El backend no devolvió los JWT esperados.', response.status, body);
  }
  saveLogin(body.data);
  return body;
}

/**
 * renewSession
 * Autor: Elmer Fuentes
 * Definición: llama a POST /auth/renovar-sesion usando el refreshToken.
 * Extiende la vigencia de la sesión en el backend por 15 segundos más
 * (tantas veces como haga falta, mientras el refreshToken de 7 días
 * siga vigente). NO reemplaza el accessToken: el backend valida su
 * accessToken vigente contra la sesión en base de datos, no contra el
 * `exp` propio del JWT, así que el mismo accessToken se sigue usando.
 * @returns La respuesta del backend con las nuevas fechas de vigencia.
 * @throws ApiError si no hay refreshToken guardado, o si el refreshToken
 *         ya venció / la sesión fue cerrada (en ese caso corresponde
 *         hacer logout y pedir credenciales de nuevo).
 */
export async function renewSession(): Promise<RenewResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiError('No existe refreshToken. Iniciá sesión nuevamente.', 401);

  const response = await fetch(`${API_BASE_URL}/auth/renovar-sesion`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refreshToken}`,
      Accept: 'application/json'
    }
  });

  const body = await parseResponse<RenewResponse>(response);
  if (!body?.exito || !body?.data?.sessionExpiraEn) {
    throw new ApiError('El backend no confirmó la renovación de la sesión.', response.status, body);
  }

  return body;
}

/**
 * logout
 * Autor: Elmer Fuentes
 * Definición: llama a POST /auth/logout con el refreshToken para cerrar
 * la sesión en el backend (invalida accessToken y refreshToken de
 * inmediato) y, pase lo que pase con la llamada al backend, limpia
 * siempre los tokens guardados en el navegador.
 */
export async function logout() {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          Accept: 'application/json'
        }
      });
      await parseResponse(response);
    }
  } finally {
    clearAuth();
  }
}

/**
 * protectedFetch
 * Autor: Elmer Fuentes
 * Definición: hace una petición autenticada a un endpoint protegido del
 * CRUD, enviando el accessToken actual en el header Authorization. El
 * accessToken dura solo 15 segundos, así que si el backend responde 401
 * (porque la sesión en base de datos ya venció), se intenta renovar la
 * sesión UNA vez usando el refreshToken y se reintenta la petición
 * original con el MISMO accessToken (no se pide uno nuevo).
 * @param path       Ruta relativa del endpoint (ej. '/clientes/consultar').
 * @param init        Opciones estándar de fetch (method, body, headers, etc).
 * @param allowRenew  Si es false, no intenta renovar ante un 401 (evita bucles infinitos en el reintento).
 * @returns El body de la respuesta, ya parseado.
 * @throws ApiError si no hay accessToken, o si la petición falla incluso después de renovar.
 */
export async function protectedFetch<T = unknown>(path: string, init: RequestInit = {}, allowRenew = true): Promise<T> {
  const accessToken = getAccessToken();
  if (!accessToken) throw new ApiError('No existe accessToken.', 401);

  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${accessToken}`);
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers
  });

  // Si el backend devuelve 401 porque la sesión (accessToken) venció en BD,
  // renovamos la sesión con el refreshToken y reintentamos UNA sola vez,
  // reutilizando el mismo accessToken (el backend no emite uno nuevo).
  if (response.status === 401 && allowRenew && getRefreshToken()) {
    await renewSession();
    return protectedFetch<T>(path, init, false);
  }

  return parseResponse<T>(response);
}

/**
 * pingApi
 * Autor: Elmer Fuentes
 * Definición: comprueba si el backend está en línea, mandando un POST
 * deliberadamente inválido a /auth/login (si responde 400/401 el
 * backend sí está respondiendo, solo rechazó datos vacíos).
 * @returns { online, status } con el estado detectado de la API.
 */
export async function pingApi() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({})
    });
    return { online: response.status > 0 && response.status < 500, status: response.status };
  } catch {
    return { online: false, status: 0 };
  }
}

export { API_BASE_URL };
