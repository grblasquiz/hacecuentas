import { describe, expect, it } from 'vitest';
import { CALENDARIO_COMPLETO, calcularCalendario, hoyEnBuenosAires, proximoFeriado, resultadoCalendario } from '../src/lib/feriados-calendario';

describe('calendario argentino de feriados 2026', () => {
  it.each([
    ['2026-11-20', 1, 1, 1],
    ['2026-11-23', 0, 0, 0],
    ['2026-12-07', 1, 0, 0],
    ['2026-12-08', 0, 0, 0],
    ['2026-11-09', 0, 0, 0],
    ['2026-11-10', 1, 1, 0],
  ])('clasifica el día %s en los tres calendarios', (fecha, nacional, turistico, bancario) => {
    expect(calcularCalendario(fecha, fecha, 'nacional', false, 0).habiles).toBe(nacional);
    expect(calcularCalendario(fecha, fecha, 'no-laborables', false, 0).habiles).toBe(turistico);
    expect(calcularCalendario(fecha, fecha, 'bancario', true, 0).habiles).toBe(bancario);
  });

  it('usa la medianoche de Buenos Aires y respeta las fechas observadas', () => {
    const antes = hoyEnBuenosAires(new Date('2026-11-23T02:59:59Z'));
    const despues = hoyEnBuenosAires(new Date('2026-11-23T03:00:00Z'));
    expect(antes).toBe('2026-11-22');
    expect(despues).toBe('2026-11-23');
    expect(proximoFeriado(antes)?.fecha).toBe('2026-11-23');
    expect(proximoFeriado(despues)?.fecha).toBe('2026-11-23');
    expect(proximoFeriado('2026-11-24')?.fecha).toBe('2026-12-08');
    expect(proximoFeriado('2026-12-09')?.fecha).toBe('2026-12-25');
    expect(proximoFeriado('2027-01-01')).toBeUndefined();
  });

  it('conserva tipos y muestra el próximo feriado dentro del intervalo', () => {
    expect(CALENDARIO_COMPLETO.find(({ fecha }) => fecha === '2026-11-23')?.trasladadoDe).toBe('2026-11-20');
    expect(CALENDARIO_COMPLETO.find(({ fecha }) => fecha === '2026-12-07')?.grupo).toBe('puente');
    expect(CALENDARIO_COMPLETO.find(({ fecha }) => fecha === '2026-12-08')?.grupo).toBe('nacional');
    expect(resultadoCalendario('next', '2026-11-20', '2026-11-20', 'nacional', false, 0).texto).toBe('Sin feriados');
    expect(resultadoCalendario('next', '2026-11-23', '2026-11-23', 'nacional', false, 0).texto).toBe('23 de noviembre');
  });

  it('solo extiende el finde de diciembre si se observa el 7 o se dedica un día de licencia', () => {
    const desde = '2026-12-05';
    const hasta = '2026-12-08';
    expect(calcularCalendario(desde, hasta, 'nacional', false, 0).findes).toEqual([]);
    expect(calcularCalendario(desde, hasta, 'nacional', false, 1).findes).toEqual([
      { desde, hasta, dias: 4, licencias: 1 },
    ]);
    expect(calcularCalendario(desde, hasta, 'bancario', true, 0).findes).toEqual([
      { desde, hasta, dias: 4, licencias: 0 },
    ]);
  });
});
