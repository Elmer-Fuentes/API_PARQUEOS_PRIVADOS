-- Proyecto: Parqueo Privados GT
-- Autor: Elmer Fuentes
-- Práctica Semana 9 - Desarrollo Web

CREATE TABLE IF NOT EXISTS sedes (
  id SERIAL PRIMARY KEY, nombre VARCHAR(120) NOT NULL, direccion VARCHAR(250) NOT NULL, telefono VARCHAR(25), activo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY, nombre VARCHAR(150) NOT NULL, nit VARCHAR(20), telefono VARCHAR(25), correo VARCHAR(150), activo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS tipos_vehiculos (
  id SERIAL PRIMARY KEY, nombre VARCHAR(80) NOT NULL UNIQUE, descripcion VARCHAR(200), activo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS vehiculos (
  id SERIAL PRIMARY KEY, cliente_id INT NOT NULL REFERENCES clientes(id), tipo_vehiculo_id INT NOT NULL REFERENCES tipos_vehiculos(id), placa VARCHAR(20) NOT NULL UNIQUE, marca VARCHAR(60), modelo VARCHAR(60), color VARCHAR(40), activo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS tarifas (
  id SERIAL PRIMARY KEY, sede_id INT NOT NULL REFERENCES sedes(id), tipo_vehiculo_id INT NOT NULL REFERENCES tipos_vehiculos(id), nombre VARCHAR(100) NOT NULL, precio_hora NUMERIC(10,2) NOT NULL, precio_dia NUMERIC(10,2), activo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS espacios (
  id SERIAL PRIMARY KEY, sede_id INT NOT NULL REFERENCES sedes(id), tipo_vehiculo_id INT NOT NULL REFERENCES tipos_vehiculos(id), codigo VARCHAR(30) NOT NULL, nivel VARCHAR(30), estado VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE', activo BOOLEAN NOT NULL DEFAULT TRUE, UNIQUE(sede_id,codigo)
);
CREATE TABLE IF NOT EXISTS empleados (
  id SERIAL PRIMARY KEY, sede_id INT NOT NULL REFERENCES sedes(id), nombre VARCHAR(150) NOT NULL, dpi VARCHAR(20) NOT NULL UNIQUE, puesto VARCHAR(80) NOT NULL, telefono VARCHAR(25), activo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS turnos (
  id SERIAL PRIMARY KEY, empleado_id INT NOT NULL REFERENCES empleados(id), fecha DATE NOT NULL, hora_inicio TIME NOT NULL, hora_fin TIME NOT NULL, activo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS reservaciones (
  id SERIAL PRIMARY KEY, cliente_id INT NOT NULL REFERENCES clientes(id), vehiculo_id INT NOT NULL REFERENCES vehiculos(id), espacio_id INT NOT NULL REFERENCES espacios(id), fecha_reserva DATE NOT NULL, hora_inicio TIME NOT NULL, hora_fin TIME NOT NULL, estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
);
CREATE TABLE IF NOT EXISTS entradas (
  id SERIAL PRIMARY KEY, vehiculo_id INT NOT NULL REFERENCES vehiculos(id), espacio_id INT NOT NULL REFERENCES espacios(id), empleado_id INT NOT NULL REFERENCES empleados(id), fecha_hora_entrada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, observacion VARCHAR(250)
);
CREATE TABLE IF NOT EXISTS salidas (
  id SERIAL PRIMARY KEY, entrada_id INT NOT NULL UNIQUE REFERENCES entradas(id), empleado_id INT NOT NULL REFERENCES empleados(id), fecha_hora_salida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, total_horas NUMERIC(10,2) NOT NULL, monto_calculado NUMERIC(10,2) NOT NULL
);
CREATE TABLE IF NOT EXISTS pagos (
  id SERIAL PRIMARY KEY, salida_id INT NOT NULL REFERENCES salidas(id), cliente_id INT NOT NULL REFERENCES clientes(id), monto NUMERIC(10,2) NOT NULL, metodo_pago VARCHAR(40) NOT NULL, fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, referencia VARCHAR(100), estado VARCHAR(20) NOT NULL DEFAULT 'PAGADO'
);
CREATE TABLE IF NOT EXISTS incidencias (
  id SERIAL PRIMARY KEY, sede_id INT NOT NULL REFERENCES sedes(id), empleado_id INT NOT NULL REFERENCES empleados(id), vehiculo_id INT REFERENCES vehiculos(id), tipo VARCHAR(80) NOT NULL, descripcion VARCHAR(500) NOT NULL, fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, estado VARCHAR(20) NOT NULL DEFAULT 'ABIERTA'
);

-- Seguridad JWT
CREATE TABLE IF NOT EXISTS usuarios_sistema (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(80) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  password_hash VARCHAR(300) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sesiones_usuario (
  id BIGSERIAL PRIMARY KEY,
  sesion_id UUID NOT NULL UNIQUE,
  usuario_id INT NOT NULL REFERENCES usuarios_sistema(id),
  login_jti UUID NOT NULL UNIQUE,
  session_jti UUID NOT NULL UNIQUE,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion_login TIMESTAMP NOT NULL,
  fecha_expiracion_sesion TIMESTAMP NOT NULL,
  fecha_cierre TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS ix_sesiones_usuario_validacion
ON sesiones_usuario(sesion_id, usuario_id, activa);
