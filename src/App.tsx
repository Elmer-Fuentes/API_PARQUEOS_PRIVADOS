/**
 * App.tsx
 * -----------------------------------------------------------------------
 * Autor: Elmer Fuentes
 *
 * Definición: pantalla de demostración del flujo de autenticación de
 * Parqueo Privados GT. Permite iniciar sesión, ver el contenido del
 * accessToken (15 segundos) y del refreshToken (7 días), probar un
 * endpoint protegido, forzar la renovación de sesión y cerrar sesión.
 */
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  API_BASE_URL,
  ApiError,
  clearAuth,
  decodeJwt,
  getAccessToken,
  getRefreshToken,
  getUser,
  isAuthenticated,
  login,
  logout,
  pingApi,
  protectedFetch,
  renewSession
} from './services/authService';
import type { JwtPayload } from './types/auth';
import './styles.css';

type Message = { type: 'success' | 'error' | 'info'; text: string } | null;

/** Definición: da formato legible en español a una fecha en epoch-segundos (campo `exp` de un JWT). Autor: Elmer Fuentes */
function formatDate(exp?: number) {
  return exp ? new Date(exp * 1000).toLocaleString('es-GT') : '—';
}

/** Definición: da formato legible a una fecha en formato ISO recibida del backend. Autor: Elmer Fuentes */
function formatIso(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-GT');
}

/** Definición: recorta un identificador largo (JTI, sesionId) para mostrarlo compacto en pantalla. Autor: Elmer Fuentes */
function short(value?: string) {
  if (!value) return '—';
  return value.length > 18 ? `${value.slice(0, 8)}…${value.slice(-8)}` : value;
}

/**
 * copyToClipboard
 * Definición: copia un texto (el JWT crudo) al portapapeles, para poder
 * pegarlo directo en Postman/Swagger sin tener que seleccionarlo a mano.
 * Autor: Elmer Fuentes
 */
async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [usuario, setUsuario] = useState('admin');
  const [password, setPassword] = useState('Admin123*');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState<Message>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [output, setOutput] = useState('Todavía no se ha consultado un endpoint protegido.');
  const [version, setVersion] = useState(0);
  const [lastRenew, setLastRenew] = useState<{ sessionExpiraEn: string; loginExpiraEn: string } | null>(null);

  // El "JWT de login" es el refreshToken (7 días). El "JWT de sesión" es el accessToken (15 segundos).
  const refreshPayload = useMemo(() => decodeJwt(getRefreshToken()), [authenticated, version]);
  const accessPayload = useMemo(() => decodeJwt(getAccessToken()), [authenticated, version]);
  const user = useMemo(() => getUser(), [authenticated, version]);

  /** Definición: consulta si el backend está en línea y actualiza el indicador de estado. Autor: Elmer Fuentes */
  async function checkApi() {
    const result = await pingApi();
    setApiOnline(result.online);
  }

  useEffect(() => {
    checkApi();
  }, []);

  /** Definición: maneja el envío del formulario de login. Autor: Elmer Fuentes */
  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy('login');
    try {
      await login(usuario.trim(), password);
      setAuthenticated(true);
      setVersion((v) => v + 1);
      setMessage({ type: 'success', text: 'Login correcto. Se recibieron accessToken (15s) y refreshToken (7 días).' });
      await validateProtected();
    } catch (err) {
      const error = err as ApiError;
      setMessage({ type: 'error', text: error.message || 'No fue posible iniciar sesión.' });
    } finally {
      setBusy('');
      checkApi();
    }
  }

  /** Definición: llama a un endpoint protegido del CRUD usando el accessToken actual. Autor: Elmer Fuentes */
  async function validateProtected() {
    setBusy('validate');
    try {
      const data = await protectedFetch('/clientes/consultar');
      setOutput(JSON.stringify(data, null, 2));
      setVersion((v) => v + 1);
      setMessage({ type: 'success', text: 'Endpoint protegido respondió correctamente con el accessToken.' });
    } catch (err) {
      const error = err as ApiError;
      setOutput(JSON.stringify(error.body || { message: error.message, status: error.status }, null, 2));
      setMessage({ type: 'error', text: error.message });
      if (error.status === 401 && !isAuthenticated()) setAuthenticated(false);
    } finally {
      setBusy('');
    }
  }

  /**
   * handleRenew
   * Definición: fuerza la renovación de la sesión usando el refreshToken.
   * El accessToken NO cambia (el backend no emite uno nuevo); lo que
   * cambia es la fecha hasta la que el backend seguirá aceptando la
   * sesión en base de datos. Por eso aquí se muestran las nuevas fechas
   * de vigencia en vez de comparar el JTI del accessToken.
   * Autor: Elmer Fuentes
   */
  async function handleRenew() {
    setMessage(null);
    setBusy('renew');
    try {
      const respuesta = await renewSession();
      setLastRenew({
        sessionExpiraEn: respuesta.data.sessionExpiraEn,
        loginExpiraEn: respuesta.data.loginExpiraEn
      });
      setVersion((v) => v + 1);
      setMessage({
        type: 'success',
        text: 'Renovación correcta: la sesión se extendió. El accessToken es el mismo, pero el backend ampliará su vigencia real en base de datos.'
      });
    } catch (err) {
      const error = err as ApiError;
      setMessage({ type: 'error', text: error.message });
    } finally {
      setBusy('');
    }
  }

  /** Definición: cierra la sesión en el backend (invalida accessToken y refreshToken) y limpia el estado local. Autor: Elmer Fuentes */
  async function handleLogout() {
    setBusy('logout');
    try {
      await logout();
    } catch (err) {
      console.warn(err);
      clearAuth();
    } finally {
      setAuthenticated(false);
      setVersion((v) => v + 1);
      setBusy('');
      setOutput('Todavía no se ha consultado un endpoint protegido.');
      setLastRenew(null);
      setMessage({ type: 'info', text: 'Sesión cerrada.' });
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <div>
            <strong>Parqueo Privados GT</strong>
            <span>React + Vite + TypeScript</span>
          </div>
        </div>
        <div className={`status ${apiOnline ? 'online' : apiOnline === false ? 'offline' : ''}`}>
          <i />
          {apiOnline === null ? 'Comprobando API…' : apiOnline ? 'API disponible' : 'API sin conexión'}
        </div>
      </header>

      {!authenticated ? (
        <section className="login-layout">
          <div className="hero-copy">
            <span className="eyebrow">AUTENTICACIÓN JWT</span>
            <h1>Frontend independiente conectado a tu API real.</h1>
            <p>
              El <b>refreshToken</b> (7 días) solo sirve para renovar o cerrar sesión, y el <b>accessToken</b> (15 segundos) es el que consume los endpoints CRUD protegidos. Al cerrar sesión aquí, el backend invalida ambos tokens de inmediato en cualquier cliente (Postman, Swagger, etc).
            </p>
            <div className="api-url"><span>API</span>{API_BASE_URL}</div>
          </div>

          <form className="card login-card" onSubmit={handleLogin}>
            <h2>Iniciar sesión</h2>
            <p className="muted">Probá con el usuario de tu base de datos.</p>

            <label>Usuario</label>
            <input value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" />

            <label>Contraseña</label>
            <div className="password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="ghost small" onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>

            <button className="primary" disabled={busy === 'login'}>
              {busy === 'login' ? 'Validando…' : 'Ingresar'}
            </button>

            {message && <div className={`message ${message.type}`}>{message.text}</div>}
          </form>
        </section>
      ) : (
        <section className="dashboard">
          <div className="dashboard-heading">
            <div>
              <span className="eyebrow">SESIÓN AUTENTICADA</span>
              <h1>Hola, {user?.nombre || user?.usuario}</h1>
              <p>Acá podés validar exactamente qué token se está usando y comprobar la renovación.</p>
            </div>
            <button className="ghost danger" onClick={handleLogout} disabled={busy === 'logout'}>
              {busy === 'logout' ? 'Cerrando…' : 'Cerrar sesión'}
            </button>
          </div>

          {message && <div className={`message wide ${message.type}`}>{message.text}</div>}

          <div className="token-grid">
            <TokenCard
              title="refreshToken (7 días)"
              payload={refreshPayload}
              token={getRefreshToken()}
              description="Solo renovar sesión / logout"
            />
            <TokenCard
              title="accessToken (15 segundos)"
              payload={accessPayload}
              token={getAccessToken()}
              description="Endpoints CRUD protegidos"
            />
          </div>

          {lastRenew && (
            <div className="renew-proof card">
              <strong>Prueba de renovación</strong>
              <div><span>Sesión (accessToken) vence</span><code>{formatIso(lastRenew.sessionExpiraEn)}</code></div>
              <div><span>Login (refreshToken) vence</span><code>{formatIso(lastRenew.loginExpiraEn)}</code></div>
              <div className="proof-ok">✓ El backend confirmó y extendió la sesión</div>
            </div>
          )}

          <div className="actions card">
            <div>
              <h3>Pruebas de autenticación</h3>
              <p className="muted">No necesitás pegar JWT manualmente.</p>
            </div>
            <div className="button-row">
              <button className="primary" onClick={validateProtected} disabled={busy !== ''}>
                {busy === 'validate' ? 'Consultando…' : 'Probar /clientes/consultar'}
              </button>
              <button className="secondary" onClick={handleRenew} disabled={busy !== ''}>
                {busy === 'renew' ? 'Renovando…' : 'Renovar sesión'}
              </button>
            </div>
          </div>

          <div className="card response-card">
            <div className="response-head">
              <h3>Respuesta API</h3>
              <span>{API_BASE_URL}</span>
            </div>
            <pre>{output}</pre>
          </div>
        </section>
      )}
    </main>
  );
}

/**
 * TokenCard
 * Definición: tarjeta que muestra el contenido decodificado de un JWT
 * (accessToken o refreshToken) y, además, el token crudo completo con un
 * botón para copiarlo — pensado para pegarlo directo en Postman o en el
 * candado "Authorize" de Swagger y así probar el backend por fuera del
 * frontend.
 * Autor: Elmer Fuentes
 */
function TokenCard({
  title,
  payload,
  token,
  description
}: {
  title: string;
  payload: JwtPayload | null;
  token: string | null;
  description: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!token) return;
    const ok = await copyToClipboard(token);
    setCopied(ok);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <article className="card token-card">
      <div className="token-title">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span className={`pill ${payload?.tipo}`}>{payload?.tipo || '—'}</span>
      </div>
      <dl>
        <div><dt>Usuario</dt><dd>{payload?.usuario || '—'}</dd></div>
        <div><dt>Sesión ID</dt><dd title={payload?.sesionId}>{short(payload?.sesionId)}</dd></div>
        <div><dt>JTI</dt><dd title={payload?.jti}>{short(payload?.jti)}</dd></div>
        <div><dt>Expira</dt><dd>{formatDate(payload?.exp)}</dd></div>
      </dl>
      {token && (
        <div className="raw-token-box">
          <div className="raw-token-head">
            <span>Token completo (para Postman / Swagger)</span>
            <button type="button" className="ghost small" onClick={handleCopy}>
              {copied ? 'Copiado ✓' : 'Copiar'}
            </button>
          </div>
          <div className="raw-token-value">{token}</div>
        </div>
      )}
    </article>
  );
}

export default App;
