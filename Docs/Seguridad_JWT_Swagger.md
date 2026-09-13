# Seguridad JWT y Swagger

## Flujo implementado

1. `POST /api/auth/login` valida usuario/contraseña en PostgreSQL.
2. Si son correctos devuelve dos JWT:
   - `loginToken`: dura 8 horas por defecto. Solo permite renovar o cerrar la sesión.
   - `sessionToken`: dura 30 minutos por defecto. Es el único JWT aceptado por los CRUD.
3. Cada solicitud CRUD pasa por `SessionJwtGuard`.
4. El guard valida:
   - firma y expiración JWT;
   - que sea de tipo `session`;
   - que el `sesionId` y `jti` continúen activos en PostgreSQL;
   - que el login principal no haya vencido o sido cerrado.
5. `POST /api/auth/logout` recibe el `loginToken` y marca la sesión como inactiva en PostgreSQL. Desde ese instante el `sessionToken` queda rechazado con HTTP 401, aunque su `exp` todavía no haya vencido.
6. `POST /api/auth/renovar-sesion` recibe el `loginToken`, reemplaza el `jti` de sesión y devuelve un nuevo `sessionToken`; el anterior deja de ser válido.

## Swagger

Abrir `http://localhost:3000/api/docs`.

- Ejecutar **Autenticación > POST /api/auth/login**.
- Copiar `data.sessionToken`.
- Pulsar **Authorize** y pegar el token en `session-jwt`.
- Los endpoints CRUD funcionarán únicamente con ese token.
- Para `renovar-sesion` y `logout`, usar `login-jwt` con `data.loginToken`.

## Usuario de prueba

- Usuario: `admin`
- Contraseña: `Admin123*`

La contraseña no se almacena en texto plano; el script incluye un hash `scrypt` con salt.
