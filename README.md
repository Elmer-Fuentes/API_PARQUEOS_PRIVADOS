# Backend Parqueo Privados GT

API NestJS con 13 recursos y 65 operaciones CRUD mediante funciones PostgreSQL.

## Instalar, compilar y ejecutar

Se verifico con Node.js 24 y npm 11. Las dependencias usan NestJS 11, compatible con `@nestjs/mapped-types` 2.1.1. `package-lock.json` fija las versiones instaladas.

```powershell
npm ci
npm run build
npm run start:prod
```

Para desarrollo: `npm run start:dev`. La API se publica en `http://localhost:3000/api`, salvo que `PORT` indique otro puerto.

Configura `.env` con los datos de tu PostgreSQL. Si no existe, copia `.env.example`. Conserva las credenciales que ya tengas configuradas. Ejecuta los scripts de `../Database` en el orden descrito en el README principal.

```powershell
npm run db:check
```

Este comando verifica la conexion y la presencia de las 65 funciones sin modificar datos. El error `28P01` indica que PostgreSQL rechazo las credenciales; revisa `DB_USER` y `DB_PASSWORD` en `.env`.

## Autenticacion y Swagger

Con `PORT=3003`, abre `http://localhost:3003/api/docs`. Si cambias el puerto en `.env`, usa ese mismo puerto en Swagger y en tus solicitudes.

1. Ejecuta `POST /api/auth/login` con tu usuario y contraseña.
2. Copia `data.accessToken`. En **Authorize → session-jwt**, pega solamente el token, sin escribir `Bearer`.
3. Ejecuta `GET /api/vehiculos/consultar` o cualquier otro CRUD. Fuera de Swagger, envia `Authorization: Bearer <accessToken>`.
4. Conserva el mismo `accessToken`. Si su plazo vence, la siguiente solicitud comprueba el login en PostgreSQL y amplia la vigencia de la sesion automaticamente.
5. Para comprobar o mantener la sesion explicitamente, coloca `data.refreshToken` en **Authorize → login-jwt** y ejecuta `POST /api/auth/renovar-sesion`. Si el plazo sigue vigente, se conserva; si vencio, se amplia. La respuesta contiene `sesionId`, `sessionExpiraEn` y `loginExpiraEn`, sin emitir nuevos tokens.
6. `POST /api/auth/logout`, usando el `refreshToken`, invalida la sesion y ambos tokens inmediatamente.

Hay dos tokens: `accessToken` permite acceder a los servicios (vence primero, es de corta duracion), y `refreshToken` controla la duracion maxima del login y permite mantener o cerrar la sesion (vence despues, de larga duracion). El `refreshToken` unicamente deja de dar acceso cuando se cierra la sesion (logout) o cuando vence su propio plazo.

`JWT_LOGIN_MINUTES` y `JWT_SESSION_MINUTES` aceptan numeros en minutos (`480`, `30`, `0.25`) o un sufijo de unidad (`8h`, `30m`, `15s`). Por ejemplo, `JWT_SESSION_MINUTES=15s` configura un plazo de 15 segundos; la respuesta lo expresa como `sessionExpiraEnMinutos: 0.25`. Las duraciones deben ser positivas y equivaler a segundos completos. Una configuracion invalida detiene el arranque con el nombre de la variable que debes corregir. Reinicia la API cuando cambies `.env`.

La firma del JWT, su tipo y sus identificadores se verifican en cada solicitud. El `exp` firmado del accessToken conserva su valor inicial; la API acepta ese mismo token despues de dicho plazo solo si su sesion y el login asociado siguen activos en PostgreSQL. Cuando vence el plazo SQL de la sesion, se reinicia por `JWT_SESSION_MINUTES`, como maximo hasta el vencimiento del login. El plazo del login (`JWT_LOGIN_MINUTES`) nunca se extiende mediante refresh. Si el login vence o se cierra, ambos tokens reciben `401`, incluso si el accessToken todavia no alcanzo su `exp`.

Las columnas y funciones SQL existentes reciben fechas `TIMESTAMP` sin zona horaria. El repositorio envia los vencimientos como ISO UTC y los convierte explicitamente a la zona de PostgreSQL. Esto evita que una fecha de Node en Guatemala se guarde seis horas atras en una base UTC. La extension usa una actualizacion SQL atomica que conserva el `session_jti`, comprueba el estado del login y limita la nueva fecha a su vencimiento; no requiere cambiar las tablas ni instalar procedimientos adicionales. Mantén la misma zona de PostgreSQL al crear y validar sesiones, ya que las columnas existentes no guardan la zona.

Despues de actualizar, reinicia la API e inicia sesion nuevamente para obtener vencimientos correctos. Swagger conserva la autorizacion anterior al recargar la pagina: reemplaza el token guardado en **Authorize**.

## Validacion

```powershell
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run test:db
```

Las pruebas unitarias cubren validacion y actualizaciones parciales. Las pruebas HTTP inician NestJS y recorren los 13 recursos con JWT firmados y sustitutos de PostgreSQL y del repositorio de sesiones; verifican rutas, validacion, orden de parametros y conservacion de campos al editar. Tambien comprueban el mismo accessToken vencido con login activo, refresh sin nuevos tokens y rechazos por firma alterada, datos invalidos, login vencido y sesion revocada. No demuestran la ejecucion de las funciones en una base real.

`test:db` requiere PostgreSQL y permisos para crear un esquema. Ejecuta los scripts SQL en un esquema aislado dentro de una transaccion, crea un usuario temporal y comprueba login, coincidencia del vencimiento JWT/SQL, mantenimiento automatico, refresh sin rotacion y cierre por HTTP con PostgreSQL en UTC, Guatemala y Tokio. Simula el vencimiento del accessToken y del plazo SQL, verifica que los identificadores se conserven, y que el vencimiento del login bloquee ambos tokens. Tambien verifica credenciales incorrectas, tokens sin sesion coincidente, las 65 operaciones CRUD autenticadas, duplicados y relaciones. Termina con `ROLLBACK`, sin modificar los registros existentes. Esta prueba verifica los scripts incluidos; `db:check` comprueba la presencia de las funciones instaladas en tu base.

Las pruebas importan JavaScript compilado para usar los mismos metadatos de decoradores que produccion. Sus comandos compilan primero. La compilacion de produccion no reutiliza la cache incremental, para que `dist` se regenere en cada ejecucion.

Los DTO exigen los campos obligatorios del esquema, IDs enteros positivos, fechas y horas validas, limites de texto y montos no negativos con hasta dos decimales. Al editar se conservan los campos omitidos; `null` se permite solamente en campos opcionales. Las respuestas de las funciones SQL mantienen el contrato `{ exito, mensaje, data }` del proyecto.
