import { describe, it, expect } from 'vitest';
import { getActiveSeasonalEvent, SEASONAL_EVENTS } from '../src/lib/seasonal-events';

const AR = 'America/Argentina/Buenos_Aires';

describe('seasonal-events — ventanas', () => {
  it('Día del Amigo activo el 18 de julio', () => {
    const ev = getActiveSeasonalEvent(new Date('2026-07-18T15:00:00Z'), AR);
    expect(ev?.key).toBe('dia-amigo');
  });
  it('Navidad activa el 20 de diciembre', () => {
    const ev = getActiveSeasonalEvent(new Date('2026-12-20T15:00:00Z'), AR);
    expect(ev?.key).toBe('navidad');
  });
  it('Año Nuevo cruza el fin de año (30 dic y 1 ene)', () => {
    expect(getActiveSeasonalEvent(new Date('2026-12-30T15:00:00Z'), AR)?.key).toBe('ano-nuevo');
    expect(getActiveSeasonalEvent(new Date('2027-01-01T15:00:00Z'), AR)?.key).toBe('ano-nuevo');
  });
  it('una fecha sin evento devuelve null (ej. 5 de mayo)', () => {
    expect(getActiveSeasonalEvent(new Date('2026-05-05T15:00:00Z'), AR)).toBeNull();
  });
});

describe('seasonal-events — integridad del config', () => {
  it('keys únicas', () => {
    const keys = SEASONAL_EVENTS.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('todos los href apuntan a una ruta interna', () => {
    for (const e of SEASONAL_EVENTS) expect(e.href.startsWith('/')).toBe(true);
  });
  it('formato de ventana MM-DD válido', () => {
    for (const e of SEASONAL_EVENTS) {
      expect(e.from).toMatch(/^\d{2}-\d{2}$/);
      expect(e.to).toMatch(/^\d{2}-\d{2}$/);
    }
  });
});
