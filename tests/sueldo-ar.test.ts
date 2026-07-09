/**
 * Tests de la calc de sueldo AR (formulaId `sueldo-ar`) — MEJORA B2.
 *
 * Cubre:
 *   1. Golden values bruto→neto (aportes 17% con tope, Ganancias 4ta) contra la
 *      tabla de referencia del JSON.
 *   2. Modo inverso neto→bruto: la búsqueda binaria converge a <$150 del neto
 *      objetivo (roundtrip bruto→neto).
 *   3. Comparador aumento vs inflación INDEC: el poder adquisitivo real coincide
 *      con la serie del pipeline y el signo es correcto (ganó/perdió).
 *   4. Errores y flags de output por modo (brutoNecesario / poderAdquisitivoReal).
 *
 * Correr: npm test
 */
import { describe, it, expect } from 'vitest';
import { sueldoAR } from '../src/lib/formulas/sueldo-ar';
import {
  inflacionAcumuladaDesde,
  INFLACION_SERIE_DESDE,
  INFLACION_SERIE_HASTA,
  INFLACION_SERIE_MENSUAL,
} from '../src/lib/data/inflacion-serie-ar';

const SOLTERO = { conyuge: 'false', hijos: '0' } as const;

describe('sueldoAR — bruto→neto (golden values 2026, soltero sin cargas)', () => {
  it('$2.000.000 → 17% de aportes, sin Ganancias', () => {
    const r = sueldoAR({ bruto: 2_000_000, ...SOLTERO });
    expect(r.aportes).toBe(340_000);
    expect(r.ganancias).toBe(0);
    expect(r.neto).toBe(1_660_000);
  });

  it('$3.000.000 → aportes $510.000, todavía no paga Ganancias', () => {
    const r = sueldoAR({ bruto: 3_000_000, ...SOLTERO });
    expect(r.aportes).toBe(510_000);
    expect(r.ganancias).toBe(0);
    expect(r.neto).toBe(2_490_000);
  });

  it('$5.000.000 → aportes topeados en $750.491 (Ley 24.241) y paga Ganancias', () => {
    const r = sueldoAR({ bruto: 5_000_000, ...SOLTERO });
    expect(r.aportes).toBe(750_491); // 4.414.652,38 × 0,17
    expect(r.ganancias).toBeGreaterThan(0);
    // Neto de la tabla de referencia del JSON.
    expect(r.neto).toBe(3_966_499);
  });

  it('bruto inválido/0 lanza error (no devuelve 0 silencioso)', () => {
    expect(() => sueldoAR({ bruto: 0, ...SOLTERO })).toThrow();
    expect(() => sueldoAR({ bruto: NaN as any, ...SOLTERO })).toThrow();
  });

  it('sin comparador ni modo inverso, no expone brutoNecesario ni poderAdquisitivoReal', () => {
    const r = sueldoAR({ bruto: 3_000_000, ...SOLTERO });
    expect(r.brutoNecesario).toBeUndefined();
    expect(r.poderAdquisitivoReal).toBeUndefined();
  });
});

describe('sueldoAR — modo inverso neto→bruto (búsqueda binaria)', () => {
  const targets = [700_000, 1_200_000, 2_490_000, 3_966_499, 7_000_000];

  for (const target of targets) {
    it(`neto objetivo $${target.toLocaleString('es-AR')} converge a <$150`, () => {
      const r = sueldoAR({ modo: 'neto-a-bruto', netoObjetivo: target, ...SOLTERO });
      expect(r.brutoNecesario).toBeDefined();
      // El bruto necesario siempre es mayor que el neto.
      expect(r.brutoNecesario!).toBeGreaterThan(target);
      // El neto alcanzado está a <$150 del objetivo (convergencia $100 + redondeo).
      expect(Math.abs(r.neto - target)).toBeLessThanOrEqual(150);
      // Roundtrip: meter el bruto necesario en el modo directo reproduce el neto.
      const back = sueldoAR({ modo: 'bruto-a-neto', bruto: r.brutoNecesario!, ...SOLTERO });
      expect(back.neto).toBe(r.neto);
    });
  }

  it('roundtrip contra el ejemplo de la doc: neto $2.490.000 ⇒ bruto ~$3.000.000', () => {
    const r = sueldoAR({ modo: 'neto-a-bruto', netoObjetivo: 2_490_000, ...SOLTERO });
    expect(Math.abs(r.brutoNecesario! - 3_000_000)).toBeLessThanOrEqual(2_000);
  });

  it('modo inverso sin netoObjetivo lanza error', () => {
    expect(() => sueldoAR({ modo: 'neto-a-bruto', ...SOLTERO } as any)).toThrow();
    expect(() => sueldoAR({ modo: 'neto-a-bruto', netoObjetivo: 0, ...SOLTERO })).toThrow();
  });
});

describe('inflacionAcumuladaDesde (serie INDEC del pipeline)', () => {
  it('la serie mensual está poblada y ordenada', () => {
    expect(INFLACION_SERIE_MENSUAL.length).toBeGreaterThanOrEqual(6);
    const keys = INFLACION_SERIE_MENSUAL.map((m) => m.key);
    expect([...keys].sort()).toEqual(keys);
  });

  it('desde el último mes de la serie la acumulada es ~0 y exacta', () => {
    const r = inflacionAcumuladaDesde(INFLACION_SERIE_HASTA!);
    expect(r.pct).toBeCloseTo(0, 6);
    expect(r.exacto).toBe(true);
  });

  it('un mes más viejo acumula MÁS inflación que uno más nuevo (monótono)', () => {
    const nuevo = inflacionAcumuladaDesde(INFLACION_SERIE_MENSUAL[INFLACION_SERIE_MENSUAL.length - 2].key);
    const viejo = inflacionAcumuladaDesde(INFLACION_SERIE_DESDE!);
    expect(viejo.pct).toBeGreaterThan(nuevo.pct);
    expect(viejo.exacto).toBe(true);
  });

  it('anterior al inicio de la serie → estimado (exacto:false) y aún mayor', () => {
    // Dos años antes del inicio de la serie: fuera de la ventana mensual.
    const [y, m] = INFLACION_SERIE_DESDE!.split('-').map(Number);
    const viejoKey = `${y - 2}-${String(m).padStart(2, '0')}`;
    const r = inflacionAcumuladaDesde(viejoKey);
    expect(r.exacto).toBe(false);
    expect(r.pct).toBeGreaterThan(inflacionAcumuladaDesde(INFLACION_SERIE_DESDE!).pct);
  });
});

describe('sueldoAR — comparador aumento vs inflación', () => {
  const mes = INFLACION_SERIE_DESDE!; // mes dentro de la serie (exacto)
  const infl = inflacionAcumuladaDesde(mes);

  it('aumento enorme (+100%) le gana a la inflación → poder adquisitivo positivo', () => {
    const r = sueldoAR({
      bruto: 2_000_000,
      ...SOLTERO,
      compararAnterior: 'si',
      sueldoAnterior: 1_000_000,
      mesAnterior: mes,
    });
    const aumentoPct = 100; // 2.000.000 / 1.000.000 − 1
    const esperado = Number((((1 + aumentoPct / 100) / (1 + infl.pct / 100)) - 1) * 100).toFixed(1);
    expect(r.poderAdquisitivoReal).toBeDefined();
    expect(r.poderAdquisitivoReal!).toBeCloseTo(Number(esperado), 1);
    expect(r.poderAdquisitivoReal!).toBeGreaterThan(0);
  });

  it('aumento chico (+1%) pierde contra la inflación → poder adquisitivo negativo', () => {
    const r = sueldoAR({
      bruto: 1_010_000,
      ...SOLTERO,
      compararAnterior: 'si',
      sueldoAnterior: 1_000_000,
      mesAnterior: mes,
    });
    expect(r.poderAdquisitivoReal!).toBeLessThan(0);
  });

  it('el comparador no rompe el cálculo principal (neto sigue correcto)', () => {
    const base = sueldoAR({ bruto: 2_000_000, ...SOLTERO });
    const conCmp = sueldoAR({
      bruto: 2_000_000,
      ...SOLTERO,
      compararAnterior: 'si',
      sueldoAnterior: 1_000_000,
      mesAnterior: mes,
    });
    expect(conCmp.neto).toBe(base.neto);
    expect(conCmp.aportes).toBe(base.aportes);
  });

  it('compararAnterior activo pero sin datos: no rompe, no expone poder adquisitivo', () => {
    const r = sueldoAR({ bruto: 2_000_000, ...SOLTERO, compararAnterior: 'si' });
    expect(r.neto).toBe(1_660_000);
    expect(r.poderAdquisitivoReal).toBeUndefined();
  });
});
