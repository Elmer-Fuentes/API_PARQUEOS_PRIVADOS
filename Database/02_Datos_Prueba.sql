-- 5 registros de prueba por catálogo principal
INSERT INTO sedes(nombre,direccion,telefono) VALUES
('Sede Central','Zona 1, Guatemala','2222-1001'),('Sede Norte','Zona 17, Guatemala','2222-1002'),('Sede Sur','Villa Nueva, Guatemala','2222-1003'),('Sede Oriente','Carretera a El Salvador','2222-1004'),('Sede Cuilapa','Cuilapa, Santa Rosa','2222-1005');

INSERT INTO clientes(nombre,nit,telefono,correo) VALUES
('Carlos Pérez','1234567-8','5555-1001','carlos@example.com'),('Ana López','2234567-9','5555-1002','ana@example.com'),('José García','3234567-0','5555-1003','jose@example.com'),('María Hernández','4234567-1','5555-1004','maria@example.com'),('Empresa Demo, S.A.','5234567-2','5555-1005','empresa@example.com');

INSERT INTO tipos_vehiculos(nombre,descripcion) VALUES
('Motocicleta','Vehículo de dos ruedas'),('Sedán','Automóvil compacto'),('SUV','Vehículo utilitario deportivo'),('Pickup','Vehículo de carga liviana'),('Microbús','Transporte de pasajeros');

INSERT INTO vehiculos(cliente_id,tipo_vehiculo_id,placa,marca,modelo,color) VALUES
(1,2,'P001ABC','Toyota','Corolla','Gris'),(2,3,'P002BCD','Honda','CR-V','Negro'),(3,1,'M003CDE','Yamaha','FZ','Azul'),(4,4,'P004DEF','Ford','Ranger','Blanco'),(5,5,'C005EFG','Toyota','Hiace','Blanco');

INSERT INTO tarifas(sede_id,tipo_vehiculo_id,nombre,precio_hora,precio_dia) VALUES
(1,1,'Moto estándar',5.00,40.00),(1,2,'Sedán estándar',10.00,80.00),(1,3,'SUV estándar',12.00,95.00),(1,4,'Pickup estándar',12.00,95.00),(1,5,'Microbús estándar',15.00,120.00);

INSERT INTO espacios(sede_id,tipo_vehiculo_id,codigo,nivel,estado) VALUES
(1,2,'A-001','1','DISPONIBLE'),(1,2,'A-002','1','DISPONIBLE'),(1,3,'B-001','1','DISPONIBLE'),(1,1,'M-001','1','DISPONIBLE'),(1,4,'C-001','2','DISPONIBLE');

INSERT INTO empleados(sede_id,nombre,dpi,puesto,telefono) VALUES
(1,'Luis Méndez','1001001000101','Cajero','5555-2001'),(1,'Pedro Ramírez','1001001000102','Guardia','5555-2002'),(2,'Sofía Morales','1001001000103','Administrador','5555-2003'),(3,'Mario Castillo','1001001000104','Cajero','5555-2004'),(5,'Laura Gómez','1001001000105','Guardia','5555-2005');

INSERT INTO turnos(empleado_id,fecha,hora_inicio,hora_fin) VALUES
(1,CURRENT_DATE,'08:00','16:00'),(2,CURRENT_DATE,'08:00','16:00'),(3,CURRENT_DATE,'09:00','17:00'),(4,CURRENT_DATE,'14:00','22:00'),(5,CURRENT_DATE,'06:00','14:00');

INSERT INTO reservaciones(cliente_id,vehiculo_id,espacio_id,fecha_reserva,hora_inicio,hora_fin,estado) VALUES
(1,1,1,CURRENT_DATE,'09:00','11:00','CONFIRMADA'),(2,2,3,CURRENT_DATE,'10:00','12:00','PENDIENTE'),(3,3,4,CURRENT_DATE,'11:00','13:00','CONFIRMADA'),(4,4,5,CURRENT_DATE,'12:00','15:00','PENDIENTE'),(5,5,2,CURRENT_DATE,'14:00','18:00','CONFIRMADA');

INSERT INTO entradas(vehiculo_id,espacio_id,empleado_id,fecha_hora_entrada,observacion) VALUES
(1,1,1,CURRENT_TIMESTAMP - INTERVAL '5 hours','Sin novedad'),(2,3,1,CURRENT_TIMESTAMP - INTERVAL '4 hours','Sin novedad'),(3,4,2,CURRENT_TIMESTAMP - INTERVAL '3 hours','Sin novedad'),(4,5,2,CURRENT_TIMESTAMP - INTERVAL '2 hours','Sin novedad'),(5,2,1,CURRENT_TIMESTAMP - INTERVAL '1 hour','Sin novedad');

INSERT INTO salidas(entrada_id,empleado_id,fecha_hora_salida,total_horas,monto_calculado) VALUES
(1,1,CURRENT_TIMESTAMP,5,50),(2,1,CURRENT_TIMESTAMP,4,48),(3,2,CURRENT_TIMESTAMP,3,15),(4,2,CURRENT_TIMESTAMP,2,24),(5,1,CURRENT_TIMESTAMP,1,15);

INSERT INTO pagos(salida_id,cliente_id,monto,metodo_pago,fecha_pago,referencia,estado) VALUES
(1,1,50,'EFECTIVO',CURRENT_TIMESTAMP,'REF-001','PAGADO'),(2,2,48,'TARJETA',CURRENT_TIMESTAMP,'REF-002','PAGADO'),(3,3,15,'EFECTIVO',CURRENT_TIMESTAMP,'REF-003','PAGADO'),(4,4,24,'TRANSFERENCIA',CURRENT_TIMESTAMP,'REF-004','PAGADO'),(5,5,15,'TARJETA',CURRENT_TIMESTAMP,'REF-005','PAGADO');

INSERT INTO incidencias(sede_id,empleado_id,vehiculo_id,tipo,descripcion,fecha_hora,estado) VALUES
(1,1,1,'OBJETO OLVIDADO','Se encontró un objeto en el espacio A-001',CURRENT_TIMESTAMP,'ABIERTA'),(1,2,2,'RAYÓN','Cliente reporta rayón previo',CURRENT_TIMESTAMP,'CERRADA'),(2,3,NULL,'ILUMINACIÓN','Lámpara dañada',CURRENT_TIMESTAMP,'ABIERTA'),(3,4,4,'BARRERA','Falla temporal en barrera',CURRENT_TIMESTAMP,'EN PROCESO'),(5,5,5,'OTRO','Reporte de prueba',CURRENT_TIMESTAMP,'CERRADA');

-- Usuario de prueba para autenticación JWT
-- Usuario: admin | Contraseña: Admin123*
INSERT INTO usuarios_sistema(usuario,nombre,password_hash,activo)
VALUES ('admin','Administrador del Sistema','8f1ce4f74832760db63a2af5883b870f:9d2a269d27375067313c5aa81a53c1c743ff227b2964fb308dae6d143f13284f725e7148df275ffb0467a15a64038a22eb1cfe3884dbaa53d2b6cb9811f8a6d5',TRUE)
ON CONFLICT (usuario) DO NOTHING;
