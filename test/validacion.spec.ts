import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { combinarActualizacion } from '../dist/common/combinar-actualizacion.js';
import { ActualizarSedesDto } from '../dist/sedes/dto/actualizar-sedes.dto.js';
import { CrearEntradasDto } from '../dist/entradas/dto/crear-entradas.dto.js';
import { CrearReservacionesDto } from '../dist/reservaciones/dto/crear-reservaciones.dto.js';
import { CrearIncidenciasDto } from '../dist/incidencias/dto/crear-incidencias.dto.js';
import { CrearPagosDto } from '../dist/pagos/dto/crear-pagos.dto.js';
import { CrearTurnosDto } from '../dist/turnos/dto/crear-turnos.dto.js';

describe('Actualizaciones parciales', () => {
  it('conserva los campos omitidos de una instancia real del DTO', () => {
    const actual = {
      nombre: 'Anterior',
      direccion: 'Zona 1',
      activo: true,
      telefono: '1234',
    };
    const dto = plainToInstance(ActualizarSedesDto, { nombre: 'Nueva' });
    expect(combinarActualizacion(actual, dto)).toEqual({
      ...actual,
      nombre: 'Nueva',
    });
  });

  it('permite false y limpiar campos opcionales con null', async () => {
    const dto = plainToInstance(ActualizarSedesDto, {
      activo: false,
      telefono: null,
    });
    expect(await validate(dto)).toEqual([]);
    expect(
      combinarActualizacion({ activo: true, telefono: '1234' }, dto),
    ).toEqual({ activo: false, telefono: null });
  });

  it('rechaza null para columnas obligatorias al editar', async () => {
    const errors = await validate(
      plainToInstance(ActualizarSedesDto, { nombre: null, activo: null }),
    );
    expect(errors.map((error) => error.property).sort()).toEqual([
      'activo',
      'nombre',
    ]);
  });
});

describe('Validacion conforme a PostgreSQL', () => {
  it.each([CrearEntradasDto, CrearReservacionesDto])(
    'exige vehiculo_id en %s',
    async (Dto) => {
      const errors = await validate(new Dto());
      expect(errors.some((error) => error.property === 'vehiculo_id')).toBe(
        true,
      );
    },
  );

  it('exige descripcion de la incidencia y permite vehiculo opcional', async () => {
    const errors = await validate(plainToInstance(CrearIncidenciasDto, {}));
    expect(errors.some((error) => error.property === 'descripcion')).toBe(true);
    expect(errors.some((error) => error.property === 'vehiculo_id')).toBe(
      false,
    );
  });

  it.each([0, -1, 1.5, 2147483648, '1', null])(
    'rechaza ID invalido %s',
    async (vehiculo_id) => {
      const errors = await validate(
        plainToInstance(CrearEntradasDto, { vehiculo_id }),
      );
      expect(errors.some((error) => error.property === 'vehiculo_id')).toBe(
        true,
      );
    },
  );

  it.each([-1, 1.234, 100000000, '30', null])(
    'rechaza monto invalido %s',
    async (monto) => {
      const errors = await validate(plainToInstance(CrearPagosDto, { monto }));
      expect(errors.some((error) => error.property === 'monto')).toBe(true);
    },
  );

  it.each(['2026-02-30', 'no-es-fecha', '2026-09-13T09:00:00'])(
    'rechaza fecha de turno %s',
    async (fecha) => {
      const errors = await validate(plainToInstance(CrearTurnosDto, { fecha }));
      expect(errors.some((error) => error.property === 'fecha')).toBe(true);
    },
  );

  it.each(['24:00', '12:60', 'hora', '8:00'])(
    'rechaza hora %s',
    async (hora_inicio) => {
      const errors = await validate(
        plainToInstance(CrearTurnosDto, { hora_inicio }),
      );
      expect(errors.some((error) => error.property === 'hora_inicio')).toBe(
        true,
      );
    },
  );
});
