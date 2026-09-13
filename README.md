# Parqueo Privados GT - Frontend React + Vite + TypeScript

Frontend independiente creado para probar correctamente el esquema JWT del backend NestJS existente.

## Flujo implementado

- `POST http://localhost:3000/api/auth/login`
  - JSON: `{ "usuario": "admin", "password": "Admin123*" }`
  - Guarda `loginToken` y `sessionToken`.
- `POST /api/auth/renovar-sesion`
  - `Authorization: Bearer <loginToken>`
  - Reemplaza únicamente el `sessionToken`.
- `GET /api/clientes/consultar`
  - `Authorization: Bearer <sessionToken>`
  - Si devuelve 401, el frontend intenta renovar una sola vez y repite la consulta.
- `POST /api/auth/logout`
  - `Authorization: Bearer <loginToken>`

## Ejecutar

### Opción 1 - doble clic

1. Levantar primero el backend NestJS en el puerto 3000.
2. Ejecutar `start-frontend.bat`.
3. Abrir `http://localhost:5173` si Vite no abre el navegador automáticamente.

### Opción 2 - VS Code

Abrir una terminal dentro de esta carpeta y ejecutar:

```bash
npm install
npm run dev
```

## Configuración

La URL de la API está en `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Si el backend cambia de host o puerto, modificar esa línea y reiniciar Vite.

## Cómo comprobar que renovar sí funcionó

En la pantalla se muestra el `JTI` del sessionToken. Al presionar **Renovar sessionToken**, aparecerá:

- JTI anterior
- JTI nuevo
- confirmación de que el token cambió

Esto permite comprobar que no solo se hizo clic, sino que `/auth/renovar-sesion` realmente generó y almacenó otro JWT.
