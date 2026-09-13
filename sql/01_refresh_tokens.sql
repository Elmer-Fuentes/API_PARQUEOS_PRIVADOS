-- Las sesiones anteriores conservan su estado; obtienen refresh al hacer login.
ALTER TABLE sesiones_usuario
  ADD COLUMN IF NOT EXISTS refresh_jti UUID,
  ADD COLUMN IF NOT EXISTS fecha_expiracion_refresh TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS ix_sesiones_usuario_refresh
  ON sesiones_usuario(refresh_jti) WHERE refresh_jti IS NOT NULL;
