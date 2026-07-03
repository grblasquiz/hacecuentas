import { describe, it, expect } from 'vitest';
import { getHomeContextByDate, isWeekendMode, DEFAULT_TIMEZONE } from '../src/lib/home-context';

// Fechas de referencia en 2026 (UTC). Buenos Aires = UTC-3 todo el año (sin DST).
//   2026-07-03 = viernes · 2026-07-04 = sábado · 2026-07-05 = domingo · 2026-07-06 = lunes
const AR = DEFAULT_TIMEZONE;

describe('getHomeContextByDate — día de la semana (ART)', () => {
  it('lunes = weekday', () => {
    expect(getHomeContextByDate(new Date('2026-07-06T14:00:00Z'), AR)).toBe('weekday');
  });
  it('miércoles = weekday', () => {
    expect(getHomeContextByDate(new Date('2026-07-08T14:00:00Z'), AR)).toBe('weekday');
  });
  it('sábado = weekend', () => {
    expect(getHomeContextByDate(new Date('2026-07-04T10:00:00Z'), AR)).toBe('weekend');
  });
  it('domingo = weekend', () => {
    expect(getHomeContextByDate(new Date('2026-07-05T23:00:00Z'), AR)).toBe('weekend');
  });
});

describe('getHomeContextByDate — corte del viernes', () => {
  it('viernes 12:00 ART (antes del corte 15) = weekday', () => {
    // 15:00 UTC = 12:00 ART
    expect(getHomeContextByDate(new Date('2026-07-03T15:00:00Z'), AR)).toBe('weekday');
  });
  it('viernes 15:00 ART (en el corte) = friday', () => {
    // 18:00 UTC = 15:00 ART
    expect(getHomeContextByDate(new Date('2026-07-03T18:00:00Z'), AR)).toBe('friday');
  });
  it('viernes 21:00 ART = friday', () => {
    expect(getHomeContextByDate(new Date('2026-07-04T00:00:00Z'), AR)).toBe('friday');
  });
  it('corte configurable: viernes 12 ART con corte=10 = friday', () => {
    expect(getHomeContextByDate(new Date('2026-07-03T15:00:00Z'), AR, 10)).toBe('friday');
  });
});

describe('getHomeContextByDate — sensibilidad a timezone', () => {
  it('mismo instante: sábado 01:00 UTC es viernes 22 en ART pero sábado en UTC', () => {
    const inst = new Date('2026-07-04T01:00:00Z');
    expect(getHomeContextByDate(inst, AR)).toBe('friday');   // vie 22:00 ART
    expect(getHomeContextByDate(inst, 'UTC')).toBe('weekend'); // sáb 01:00 UTC
  });
  it('medianoche ART no rompe (hour normalizado)', () => {
    // 03:00 UTC = 00:00 ART del sábado
    expect(getHomeContextByDate(new Date('2026-07-04T03:00:00Z'), AR)).toBe('weekend');
  });
});

describe('isWeekendMode', () => {
  it('friday y weekend activan el modo finde', () => {
    expect(isWeekendMode('friday')).toBe(true);
    expect(isWeekendMode('weekend')).toBe(true);
  });
  it('weekday NO activa el modo finde', () => {
    expect(isWeekendMode('weekday')).toBe(false);
  });
});
