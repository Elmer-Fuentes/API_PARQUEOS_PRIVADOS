-- Proyecto: Parqueo Privados GT
-- Autor: Elmer Fuentes
-- Stored procedures/funciones CRUD con respuesta JSON y manejo EXCEPTION


CREATE OR REPLACE FUNCTION sp_sedes_consultar() RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Consulta realizada correctamente.', 'data', COALESCE((SELECT jsonb_agg(t ORDER BY id) FROM sedes t), '[]'::jsonb));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', '[]'::jsonb);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_sedes_buscar(p_id INT) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  SELECT to_jsonb(t) INTO v_data FROM sedes t WHERE id=p_id;
  IF v_data IS NULL THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro encontrado.', 'data', v_data);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_sedes_agregar(p_nombre VARCHAR, p_direccion VARCHAR, p_telefono VARCHAR, p_activo BOOLEAN) RETURNS JSONB AS $$
DECLARE v_id INT; v_data JSONB;
BEGIN
  INSERT INTO sedes(nombre, direccion, telefono, activo) VALUES(p_nombre, p_direccion, p_telefono, p_activo) RETURNING id INTO v_id;
  SELECT to_jsonb(t) INTO v_data FROM sedes t WHERE id=v_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro agregado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_sedes_editar(p_id INT, p_nombre VARCHAR, p_direccion VARCHAR, p_telefono VARCHAR, p_activo BOOLEAN) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM sedes WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  UPDATE sedes SET nombre=p_nombre, direccion=p_direccion, telefono=p_telefono, activo=p_activo WHERE id=p_id;
  SELECT to_jsonb(t) INTO v_data FROM sedes t WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro editado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_sedes_eliminar(p_id INT) RETURNS JSONB AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM sedes WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  DELETE FROM sedes WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro eliminado correctamente.', 'data', jsonb_build_object('id',p_id));
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'No se puede eliminar: el registro está relacionado con otros datos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sp_clientes_consultar() RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Consulta realizada correctamente.', 'data', COALESCE((SELECT jsonb_agg(t ORDER BY id) FROM clientes t), '[]'::jsonb));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', '[]'::jsonb);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_clientes_buscar(p_id INT) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  SELECT to_jsonb(t) INTO v_data FROM clientes t WHERE id=p_id;
  IF v_data IS NULL THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro encontrado.', 'data', v_data);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_clientes_agregar(p_nombre VARCHAR, p_nit VARCHAR, p_telefono VARCHAR, p_correo VARCHAR, p_activo BOOLEAN) RETURNS JSONB AS $$
DECLARE v_id INT; v_data JSONB;
BEGIN
  INSERT INTO clientes(nombre, nit, telefono, correo, activo) VALUES(p_nombre, p_nit, p_telefono, p_correo, p_activo) RETURNING id INTO v_id;
  SELECT to_jsonb(t) INTO v_data FROM clientes t WHERE id=v_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro agregado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_clientes_editar(p_id INT, p_nombre VARCHAR, p_nit VARCHAR, p_telefono VARCHAR, p_correo VARCHAR, p_activo BOOLEAN) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM clientes WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  UPDATE clientes SET nombre=p_nombre, nit=p_nit, telefono=p_telefono, correo=p_correo, activo=p_activo WHERE id=p_id;
  SELECT to_jsonb(t) INTO v_data FROM clientes t WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro editado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_clientes_eliminar(p_id INT) RETURNS JSONB AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM clientes WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  DELETE FROM clientes WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro eliminado correctamente.', 'data', jsonb_build_object('id',p_id));
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'No se puede eliminar: el registro está relacionado con otros datos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sp_tipos_vehiculos_consultar() RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Consulta realizada correctamente.', 'data', COALESCE((SELECT jsonb_agg(t ORDER BY id) FROM tipos_vehiculos t), '[]'::jsonb));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', '[]'::jsonb);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_tipos_vehiculos_buscar(p_id INT) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  SELECT to_jsonb(t) INTO v_data FROM tipos_vehiculos t WHERE id=p_id;
  IF v_data IS NULL THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro encontrado.', 'data', v_data);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_tipos_vehiculos_agregar(p_nombre VARCHAR, p_descripcion VARCHAR, p_activo BOOLEAN) RETURNS JSONB AS $$
DECLARE v_id INT; v_data JSONB;
BEGIN
  INSERT INTO tipos_vehiculos(nombre, descripcion, activo) VALUES(p_nombre, p_descripcion, p_activo) RETURNING id INTO v_id;
  SELECT to_jsonb(t) INTO v_data FROM tipos_vehiculos t WHERE id=v_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro agregado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_tipos_vehiculos_editar(p_id INT, p_nombre VARCHAR, p_descripcion VARCHAR, p_activo BOOLEAN) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM tipos_vehiculos WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  UPDATE tipos_vehiculos SET nombre=p_nombre, descripcion=p_descripcion, activo=p_activo WHERE id=p_id;
  SELECT to_jsonb(t) INTO v_data FROM tipos_vehiculos t WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro editado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_tipos_vehiculos_eliminar(p_id INT) RETURNS JSONB AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM tipos_vehiculos WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  DELETE FROM tipos_vehiculos WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro eliminado correctamente.', 'data', jsonb_build_object('id',p_id));
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'No se puede eliminar: el registro está relacionado con otros datos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sp_vehiculos_consultar() RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Consulta realizada correctamente.', 'data', COALESCE((SELECT jsonb_agg(t ORDER BY id) FROM vehiculos t), '[]'::jsonb));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', '[]'::jsonb);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_vehiculos_buscar(p_id INT) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  SELECT to_jsonb(t) INTO v_data FROM vehiculos t WHERE id=p_id;
  IF v_data IS NULL THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro encontrado.', 'data', v_data);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_vehiculos_agregar(p_cliente_id INT, p_tipo_vehiculo_id INT, p_placa VARCHAR, p_marca VARCHAR, p_modelo VARCHAR, p_color VARCHAR, p_activo BOOLEAN) RETURNS JSONB AS $$
DECLARE v_id INT; v_data JSONB;
BEGIN
  INSERT INTO vehiculos(cliente_id, tipo_vehiculo_id, placa, marca, modelo, color, activo) VALUES(p_cliente_id, p_tipo_vehiculo_id, p_placa, p_marca, p_modelo, p_color, p_activo) RETURNING id INTO v_id;
  SELECT to_jsonb(t) INTO v_data FROM vehiculos t WHERE id=v_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro agregado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_vehiculos_editar(p_id INT, p_cliente_id INT, p_tipo_vehiculo_id INT, p_placa VARCHAR, p_marca VARCHAR, p_modelo VARCHAR, p_color VARCHAR, p_activo BOOLEAN) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM vehiculos WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  UPDATE vehiculos SET cliente_id=p_cliente_id, tipo_vehiculo_id=p_tipo_vehiculo_id, placa=p_placa, marca=p_marca, modelo=p_modelo, color=p_color, activo=p_activo WHERE id=p_id;
  SELECT to_jsonb(t) INTO v_data FROM vehiculos t WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro editado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_vehiculos_eliminar(p_id INT) RETURNS JSONB AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM vehiculos WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  DELETE FROM vehiculos WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro eliminado correctamente.', 'data', jsonb_build_object('id',p_id));
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'No se puede eliminar: el registro está relacionado con otros datos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sp_tarifas_consultar() RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Consulta realizada correctamente.', 'data', COALESCE((SELECT jsonb_agg(t ORDER BY id) FROM tarifas t), '[]'::jsonb));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', '[]'::jsonb);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_tarifas_buscar(p_id INT) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  SELECT to_jsonb(t) INTO v_data FROM tarifas t WHERE id=p_id;
  IF v_data IS NULL THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro encontrado.', 'data', v_data);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_tarifas_agregar(p_sede_id INT, p_tipo_vehiculo_id INT, p_nombre VARCHAR, p_precio_hora NUMERIC, p_precio_dia NUMERIC, p_activo BOOLEAN) RETURNS JSONB AS $$
DECLARE v_id INT; v_data JSONB;
BEGIN
  INSERT INTO tarifas(sede_id, tipo_vehiculo_id, nombre, precio_hora, precio_dia, activo) VALUES(p_sede_id, p_tipo_vehiculo_id, p_nombre, p_precio_hora, p_precio_dia, p_activo) RETURNING id INTO v_id;
  SELECT to_jsonb(t) INTO v_data FROM tarifas t WHERE id=v_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro agregado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_tarifas_editar(p_id INT, p_sede_id INT, p_tipo_vehiculo_id INT, p_nombre VARCHAR, p_precio_hora NUMERIC, p_precio_dia NUMERIC, p_activo BOOLEAN) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM tarifas WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  UPDATE tarifas SET sede_id=p_sede_id, tipo_vehiculo_id=p_tipo_vehiculo_id, nombre=p_nombre, precio_hora=p_precio_hora, precio_dia=p_precio_dia, activo=p_activo WHERE id=p_id;
  SELECT to_jsonb(t) INTO v_data FROM tarifas t WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro editado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_tarifas_eliminar(p_id INT) RETURNS JSONB AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM tarifas WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  DELETE FROM tarifas WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro eliminado correctamente.', 'data', jsonb_build_object('id',p_id));
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'No se puede eliminar: el registro está relacionado con otros datos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sp_espacios_consultar() RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Consulta realizada correctamente.', 'data', COALESCE((SELECT jsonb_agg(t ORDER BY id) FROM espacios t), '[]'::jsonb));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', '[]'::jsonb);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_espacios_buscar(p_id INT) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  SELECT to_jsonb(t) INTO v_data FROM espacios t WHERE id=p_id;
  IF v_data IS NULL THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro encontrado.', 'data', v_data);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_espacios_agregar(p_sede_id INT, p_tipo_vehiculo_id INT, p_codigo VARCHAR, p_nivel VARCHAR, p_estado VARCHAR, p_activo BOOLEAN) RETURNS JSONB AS $$
DECLARE v_id INT; v_data JSONB;
BEGIN
  INSERT INTO espacios(sede_id, tipo_vehiculo_id, codigo, nivel, estado, activo) VALUES(p_sede_id, p_tipo_vehiculo_id, p_codigo, p_nivel, p_estado, p_activo) RETURNING id INTO v_id;
  SELECT to_jsonb(t) INTO v_data FROM espacios t WHERE id=v_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro agregado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_espacios_editar(p_id INT, p_sede_id INT, p_tipo_vehiculo_id INT, p_codigo VARCHAR, p_nivel VARCHAR, p_estado VARCHAR, p_activo BOOLEAN) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM espacios WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  UPDATE espacios SET sede_id=p_sede_id, tipo_vehiculo_id=p_tipo_vehiculo_id, codigo=p_codigo, nivel=p_nivel, estado=p_estado, activo=p_activo WHERE id=p_id;
  SELECT to_jsonb(t) INTO v_data FROM espacios t WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro editado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_espacios_eliminar(p_id INT) RETURNS JSONB AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM espacios WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  DELETE FROM espacios WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro eliminado correctamente.', 'data', jsonb_build_object('id',p_id));
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'No se puede eliminar: el registro está relacionado con otros datos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sp_empleados_consultar() RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Consulta realizada correctamente.', 'data', COALESCE((SELECT jsonb_agg(t ORDER BY id) FROM empleados t), '[]'::jsonb));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', '[]'::jsonb);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_empleados_buscar(p_id INT) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  SELECT to_jsonb(t) INTO v_data FROM empleados t WHERE id=p_id;
  IF v_data IS NULL THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro encontrado.', 'data', v_data);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_empleados_agregar(p_sede_id INT, p_nombre VARCHAR, p_dpi VARCHAR, p_puesto VARCHAR, p_telefono VARCHAR, p_activo BOOLEAN) RETURNS JSONB AS $$
DECLARE v_id INT; v_data JSONB;
BEGIN
  INSERT INTO empleados(sede_id, nombre, dpi, puesto, telefono, activo) VALUES(p_sede_id, p_nombre, p_dpi, p_puesto, p_telefono, p_activo) RETURNING id INTO v_id;
  SELECT to_jsonb(t) INTO v_data FROM empleados t WHERE id=v_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro agregado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_empleados_editar(p_id INT, p_sede_id INT, p_nombre VARCHAR, p_dpi VARCHAR, p_puesto VARCHAR, p_telefono VARCHAR, p_activo BOOLEAN) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM empleados WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  UPDATE empleados SET sede_id=p_sede_id, nombre=p_nombre, dpi=p_dpi, puesto=p_puesto, telefono=p_telefono, activo=p_activo WHERE id=p_id;
  SELECT to_jsonb(t) INTO v_data FROM empleados t WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro editado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_empleados_eliminar(p_id INT) RETURNS JSONB AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM empleados WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  DELETE FROM empleados WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro eliminado correctamente.', 'data', jsonb_build_object('id',p_id));
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'No se puede eliminar: el registro está relacionado con otros datos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sp_turnos_consultar() RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Consulta realizada correctamente.', 'data', COALESCE((SELECT jsonb_agg(t ORDER BY id) FROM turnos t), '[]'::jsonb));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', '[]'::jsonb);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_turnos_buscar(p_id INT) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  SELECT to_jsonb(t) INTO v_data FROM turnos t WHERE id=p_id;
  IF v_data IS NULL THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro encontrado.', 'data', v_data);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_turnos_agregar(p_empleado_id INT, p_fecha DATE, p_hora_inicio TIME, p_hora_fin TIME, p_activo BOOLEAN) RETURNS JSONB AS $$
DECLARE v_id INT; v_data JSONB;
BEGIN
  INSERT INTO turnos(empleado_id, fecha, hora_inicio, hora_fin, activo) VALUES(p_empleado_id, p_fecha, p_hora_inicio, p_hora_fin, p_activo) RETURNING id INTO v_id;
  SELECT to_jsonb(t) INTO v_data FROM turnos t WHERE id=v_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro agregado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_turnos_editar(p_id INT, p_empleado_id INT, p_fecha DATE, p_hora_inicio TIME, p_hora_fin TIME, p_activo BOOLEAN) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM turnos WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  UPDATE turnos SET empleado_id=p_empleado_id, fecha=p_fecha, hora_inicio=p_hora_inicio, hora_fin=p_hora_fin, activo=p_activo WHERE id=p_id;
  SELECT to_jsonb(t) INTO v_data FROM turnos t WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro editado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_turnos_eliminar(p_id INT) RETURNS JSONB AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM turnos WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  DELETE FROM turnos WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro eliminado correctamente.', 'data', jsonb_build_object('id',p_id));
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'No se puede eliminar: el registro está relacionado con otros datos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sp_reservaciones_consultar() RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Consulta realizada correctamente.', 'data', COALESCE((SELECT jsonb_agg(t ORDER BY id) FROM reservaciones t), '[]'::jsonb));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', '[]'::jsonb);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_reservaciones_buscar(p_id INT) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  SELECT to_jsonb(t) INTO v_data FROM reservaciones t WHERE id=p_id;
  IF v_data IS NULL THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro encontrado.', 'data', v_data);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_reservaciones_agregar(p_cliente_id INT, p_vehiculo_id INT, p_espacio_id INT, p_fecha_reserva DATE, p_hora_inicio TIME, p_hora_fin TIME, p_estado VARCHAR) RETURNS JSONB AS $$
DECLARE v_id INT; v_data JSONB;
BEGIN
  INSERT INTO reservaciones(cliente_id, vehiculo_id, espacio_id, fecha_reserva, hora_inicio, hora_fin, estado) VALUES(p_cliente_id, p_vehiculo_id, p_espacio_id, p_fecha_reserva, p_hora_inicio, p_hora_fin, p_estado) RETURNING id INTO v_id;
  SELECT to_jsonb(t) INTO v_data FROM reservaciones t WHERE id=v_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro agregado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_reservaciones_editar(p_id INT, p_cliente_id INT, p_vehiculo_id INT, p_espacio_id INT, p_fecha_reserva DATE, p_hora_inicio TIME, p_hora_fin TIME, p_estado VARCHAR) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM reservaciones WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  UPDATE reservaciones SET cliente_id=p_cliente_id, vehiculo_id=p_vehiculo_id, espacio_id=p_espacio_id, fecha_reserva=p_fecha_reserva, hora_inicio=p_hora_inicio, hora_fin=p_hora_fin, estado=p_estado WHERE id=p_id;
  SELECT to_jsonb(t) INTO v_data FROM reservaciones t WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro editado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_reservaciones_eliminar(p_id INT) RETURNS JSONB AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM reservaciones WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  DELETE FROM reservaciones WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro eliminado correctamente.', 'data', jsonb_build_object('id',p_id));
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'No se puede eliminar: el registro está relacionado con otros datos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sp_entradas_consultar() RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Consulta realizada correctamente.', 'data', COALESCE((SELECT jsonb_agg(t ORDER BY id) FROM entradas t), '[]'::jsonb));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', '[]'::jsonb);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_entradas_buscar(p_id INT) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  SELECT to_jsonb(t) INTO v_data FROM entradas t WHERE id=p_id;
  IF v_data IS NULL THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro encontrado.', 'data', v_data);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_entradas_agregar(p_vehiculo_id INT, p_espacio_id INT, p_empleado_id INT, p_fecha_hora_entrada TIMESTAMP, p_observacion VARCHAR) RETURNS JSONB AS $$
DECLARE v_id INT; v_data JSONB;
BEGIN
  INSERT INTO entradas(vehiculo_id, espacio_id, empleado_id, fecha_hora_entrada, observacion) VALUES(p_vehiculo_id, p_espacio_id, p_empleado_id, p_fecha_hora_entrada, p_observacion) RETURNING id INTO v_id;
  SELECT to_jsonb(t) INTO v_data FROM entradas t WHERE id=v_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro agregado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_entradas_editar(p_id INT, p_vehiculo_id INT, p_espacio_id INT, p_empleado_id INT, p_fecha_hora_entrada TIMESTAMP, p_observacion VARCHAR) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM entradas WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  UPDATE entradas SET vehiculo_id=p_vehiculo_id, espacio_id=p_espacio_id, empleado_id=p_empleado_id, fecha_hora_entrada=p_fecha_hora_entrada, observacion=p_observacion WHERE id=p_id;
  SELECT to_jsonb(t) INTO v_data FROM entradas t WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro editado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_entradas_eliminar(p_id INT) RETURNS JSONB AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM entradas WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  DELETE FROM entradas WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro eliminado correctamente.', 'data', jsonb_build_object('id',p_id));
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'No se puede eliminar: el registro está relacionado con otros datos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sp_salidas_consultar() RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Consulta realizada correctamente.', 'data', COALESCE((SELECT jsonb_agg(t ORDER BY id) FROM salidas t), '[]'::jsonb));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', '[]'::jsonb);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_salidas_buscar(p_id INT) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  SELECT to_jsonb(t) INTO v_data FROM salidas t WHERE id=p_id;
  IF v_data IS NULL THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro encontrado.', 'data', v_data);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_salidas_agregar(p_entrada_id INT, p_empleado_id INT, p_fecha_hora_salida TIMESTAMP, p_total_horas NUMERIC, p_monto_calculado NUMERIC) RETURNS JSONB AS $$
DECLARE v_id INT; v_data JSONB;
BEGIN
  INSERT INTO salidas(entrada_id, empleado_id, fecha_hora_salida, total_horas, monto_calculado) VALUES(p_entrada_id, p_empleado_id, p_fecha_hora_salida, p_total_horas, p_monto_calculado) RETURNING id INTO v_id;
  SELECT to_jsonb(t) INTO v_data FROM salidas t WHERE id=v_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro agregado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_salidas_editar(p_id INT, p_entrada_id INT, p_empleado_id INT, p_fecha_hora_salida TIMESTAMP, p_total_horas NUMERIC, p_monto_calculado NUMERIC) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM salidas WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  UPDATE salidas SET entrada_id=p_entrada_id, empleado_id=p_empleado_id, fecha_hora_salida=p_fecha_hora_salida, total_horas=p_total_horas, monto_calculado=p_monto_calculado WHERE id=p_id;
  SELECT to_jsonb(t) INTO v_data FROM salidas t WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro editado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_salidas_eliminar(p_id INT) RETURNS JSONB AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM salidas WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  DELETE FROM salidas WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro eliminado correctamente.', 'data', jsonb_build_object('id',p_id));
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'No se puede eliminar: el registro está relacionado con otros datos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sp_pagos_consultar() RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Consulta realizada correctamente.', 'data', COALESCE((SELECT jsonb_agg(t ORDER BY id) FROM pagos t), '[]'::jsonb));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', '[]'::jsonb);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_pagos_buscar(p_id INT) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  SELECT to_jsonb(t) INTO v_data FROM pagos t WHERE id=p_id;
  IF v_data IS NULL THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro encontrado.', 'data', v_data);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_pagos_agregar(p_salida_id INT, p_cliente_id INT, p_monto NUMERIC, p_metodo_pago VARCHAR, p_fecha_pago TIMESTAMP, p_referencia VARCHAR, p_estado VARCHAR) RETURNS JSONB AS $$
DECLARE v_id INT; v_data JSONB;
BEGIN
  INSERT INTO pagos(salida_id, cliente_id, monto, metodo_pago, fecha_pago, referencia, estado) VALUES(p_salida_id, p_cliente_id, p_monto, p_metodo_pago, p_fecha_pago, p_referencia, p_estado) RETURNING id INTO v_id;
  SELECT to_jsonb(t) INTO v_data FROM pagos t WHERE id=v_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro agregado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_pagos_editar(p_id INT, p_salida_id INT, p_cliente_id INT, p_monto NUMERIC, p_metodo_pago VARCHAR, p_fecha_pago TIMESTAMP, p_referencia VARCHAR, p_estado VARCHAR) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM pagos WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  UPDATE pagos SET salida_id=p_salida_id, cliente_id=p_cliente_id, monto=p_monto, metodo_pago=p_metodo_pago, fecha_pago=p_fecha_pago, referencia=p_referencia, estado=p_estado WHERE id=p_id;
  SELECT to_jsonb(t) INTO v_data FROM pagos t WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro editado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_pagos_eliminar(p_id INT) RETURNS JSONB AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM pagos WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  DELETE FROM pagos WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro eliminado correctamente.', 'data', jsonb_build_object('id',p_id));
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'No se puede eliminar: el registro está relacionado con otros datos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sp_incidencias_consultar() RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Consulta realizada correctamente.', 'data', COALESCE((SELECT jsonb_agg(t ORDER BY id) FROM incidencias t), '[]'::jsonb));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', '[]'::jsonb);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_incidencias_buscar(p_id INT) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  SELECT to_jsonb(t) INTO v_data FROM incidencias t WHERE id=p_id;
  IF v_data IS NULL THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro encontrado.', 'data', v_data);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_incidencias_agregar(p_sede_id INT, p_empleado_id INT, p_vehiculo_id INT, p_tipo VARCHAR, p_descripcion VARCHAR, p_fecha_hora TIMESTAMP, p_estado VARCHAR) RETURNS JSONB AS $$
DECLARE v_id INT; v_data JSONB;
BEGIN
  INSERT INTO incidencias(sede_id, empleado_id, vehiculo_id, tipo, descripcion, fecha_hora, estado) VALUES(p_sede_id, p_empleado_id, p_vehiculo_id, p_tipo, p_descripcion, p_fecha_hora, p_estado) RETURNING id INTO v_id;
  SELECT to_jsonb(t) INTO v_data FROM incidencias t WHERE id=v_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro agregado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_incidencias_editar(p_id INT, p_sede_id INT, p_empleado_id INT, p_vehiculo_id INT, p_tipo VARCHAR, p_descripcion VARCHAR, p_fecha_hora TIMESTAMP, p_estado VARCHAR) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM incidencias WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  UPDATE incidencias SET sede_id=p_sede_id, empleado_id=p_empleado_id, vehiculo_id=p_vehiculo_id, tipo=p_tipo, descripcion=p_descripcion, fecha_hora=p_fecha_hora, estado=p_estado WHERE id=p_id;
  SELECT to_jsonb(t) INTO v_data FROM incidencias t WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro editado correctamente.', 'data', v_data);
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Existe una referencia relacionada inexistente.', 'data', NULL);
WHEN unique_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'Ya existe un registro con datos únicos repetidos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_incidencias_eliminar(p_id INT) RETURNS JSONB AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM incidencias WHERE id=p_id) THEN RETURN jsonb_build_object('exito', false, 'mensaje', 'Registro inexistente.', 'data', NULL); END IF;
  DELETE FROM incidencias WHERE id=p_id;
  RETURN jsonb_build_object('exito', true, 'mensaje', 'Registro eliminado correctamente.', 'data', jsonb_build_object('id',p_id));
EXCEPTION WHEN foreign_key_violation THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', 'No se puede eliminar: el registro está relacionado con otros datos.', 'data', NULL);
WHEN OTHERS THEN
  RETURN jsonb_build_object('exito', false, 'mensaje', SQLERRM, 'data', NULL);
END; $$ LANGUAGE plpgsql;

-- ============================================================================
-- AUTENTICACIÓN Y SESIONES JWT
-- ============================================================================
CREATE OR REPLACE FUNCTION sp_auth_usuario_buscar(p_usuario VARCHAR) RETURNS JSONB AS $$
DECLARE v_data JSONB;
BEGIN
  SELECT jsonb_build_object('id',id,'usuario',usuario,'nombre',nombre,'password_hash',password_hash,'activo',activo)
  INTO v_data FROM usuarios_sistema WHERE lower(usuario)=lower(p_usuario) LIMIT 1;
  IF v_data IS NULL THEN
    RETURN jsonb_build_object('exito',false,'mensaje','Usuario inexistente.','data',NULL);
  END IF;
  RETURN jsonb_build_object('exito',true,'mensaje','Usuario encontrado.','data',v_data);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito',false,'mensaje',SQLERRM,'data',NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_auth_sesion_crear(
  p_sesion_id UUID, p_usuario_id INT, p_login_jti UUID, p_session_jti UUID,
  p_exp_login TIMESTAMP, p_exp_sesion TIMESTAMP
) RETURNS JSONB AS $$
BEGIN
  INSERT INTO sesiones_usuario(sesion_id,usuario_id,login_jti,session_jti,fecha_expiracion_login,fecha_expiracion_sesion)
  VALUES(p_sesion_id,p_usuario_id,p_login_jti,p_session_jti,p_exp_login,p_exp_sesion);
  RETURN jsonb_build_object('exito',true,'mensaje','Sesión creada.','data',jsonb_build_object('sesion_id',p_sesion_id));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito',false,'mensaje',SQLERRM,'data',NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_auth_sesion_validar(p_sesion_id UUID,p_usuario_id INT,p_session_jti UUID) RETURNS JSONB AS $$
BEGIN
  IF EXISTS(
    SELECT 1 FROM sesiones_usuario
    WHERE sesion_id=p_sesion_id AND usuario_id=p_usuario_id AND session_jti=p_session_jti
      AND activa=TRUE AND fecha_expiracion_sesion > CURRENT_TIMESTAMP
      AND fecha_expiracion_login > CURRENT_TIMESTAMP
  ) THEN
    RETURN jsonb_build_object('exito',true,'mensaje','Sesión válida.','data',NULL);
  END IF;
  RETURN jsonb_build_object('exito',false,'mensaje','Sesión inválida, vencida o cerrada.','data',NULL);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito',false,'mensaje',SQLERRM,'data',NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_auth_login_validar(p_sesion_id UUID,p_usuario_id INT,p_login_jti UUID) RETURNS JSONB AS $$
BEGIN
  IF EXISTS(
    SELECT 1 FROM sesiones_usuario
    WHERE sesion_id=p_sesion_id AND usuario_id=p_usuario_id AND login_jti=p_login_jti
      AND activa=TRUE AND fecha_expiracion_login > CURRENT_TIMESTAMP
  ) THEN
    RETURN jsonb_build_object('exito',true,'mensaje','Login válido.','data',NULL);
  END IF;
  RETURN jsonb_build_object('exito',false,'mensaje','Login inválido, vencido o cerrado.','data',NULL);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito',false,'mensaje',SQLERRM,'data',NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_auth_sesion_renovar(
  p_sesion_id UUID,p_usuario_id INT,p_login_jti UUID,p_session_jti UUID,p_exp_sesion TIMESTAMP
) RETURNS JSONB AS $$
BEGIN
  IF NOT EXISTS(
    SELECT 1 FROM sesiones_usuario
    WHERE sesion_id=p_sesion_id AND usuario_id=p_usuario_id AND login_jti=p_login_jti
      AND activa=TRUE AND fecha_expiracion_login > CURRENT_TIMESTAMP
  ) THEN
    RETURN jsonb_build_object('exito',false,'mensaje','El token de login ya no es válido.','data',NULL);
  END IF;
  UPDATE sesiones_usuario
  SET session_jti=p_session_jti, fecha_expiracion_sesion=p_exp_sesion
  WHERE sesion_id=p_sesion_id AND usuario_id=p_usuario_id;
  RETURN jsonb_build_object('exito',true,'mensaje','Sesión renovada.','data',NULL);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito',false,'mensaje',SQLERRM,'data',NULL);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_auth_sesion_cerrar(p_sesion_id UUID,p_usuario_id INT,p_login_jti UUID) RETURNS JSONB AS $$
BEGIN
  UPDATE sesiones_usuario
  SET activa=FALSE, fecha_cierre=CURRENT_TIMESTAMP
  WHERE sesion_id=p_sesion_id AND usuario_id=p_usuario_id AND login_jti=p_login_jti AND activa=TRUE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('exito',false,'mensaje','La sesión ya estaba cerrada o no existe.','data',NULL);
  END IF;
  RETURN jsonb_build_object('exito',true,'mensaje','Sesión cerrada. El token de sesión quedó invalidado.','data',NULL);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('exito',false,'mensaje',SQLERRM,'data',NULL);
END; $$ LANGUAGE plpgsql;
