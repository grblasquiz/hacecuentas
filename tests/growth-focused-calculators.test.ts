import { describe, expect, it } from 'vitest';
import { gratificacionSemestral } from '../src/lib/formulas/gratificacion-semestral-peru';
import { recategorizacionMonotributo } from '../src/lib/formulas/recategorizacion-monotributo';
import { PRECIO_UNITARIO_MAX_BIENES, TOPES } from '../src/lib/data/monotributo-2026';

describe('gratificación semestral de Perú', () => {
  const full = { sueldo: 1800, asignacion: false, eps: false, meses: 6, faltas: 0, variables: [] };
  it('applies the EPS rate to four full months', () => {
    expect(gratificacionSemestral({ ...full, meses: 4, eps: true }))
      .toMatchObject({ gratificacion: 1200, bonificacion: 81, total: 1281 });
  });
  it('includes regular variable pay, family allowance and the fraction for noncomputable days', () => {
    expect(gratificacionSemestral({ ...full, asignacion: true, faltas: 3, variables: [200, 0, 200, 0, 200, 0] }))
      .toMatchObject({ base: 2013, gratificacion: 1979.45, bonificacion: 178.15, total: 2157.6 });
  });
  it('omits variable pay received in only two months', () => {
    expect(gratificacionSemestral({ ...full, variables: [800, 800, 0, 0, 0, 0] }).total).toBe(1962);
  });
});

describe('recategorización del monotributo', () => {
  const values = { ingresos: TOPES.A, alquiler: 0, superficie: 0, energia: 0, precio: 0 };
  it('accepts an exact category threshold and applies the higher physical parameter', () => {
    expect(recategorizacionMonotributo(values)).toMatchObject({ categoria: 'A', margenIngresos: 0 });
    expect(recategorizacionMonotributo({ ...values, superficie: 55 })).toMatchObject({ categoria: 'C' });
    expect(recategorizacionMonotributo({ ...values, alquiler: 6_000_000 })).toMatchObject({ categoria: 'H' });
  });
  it('detects excesses beyond K or the maximum price', () => {
    expect(recategorizacionMonotributo({ ...values, energia: 20_000.01 }).categoria).toBeNull();
    expect(recategorizacionMonotributo({ ...values, precio: PRECIO_UNITARIO_MAX_BIENES + 0.01 }))
      .toMatchObject({ categoria: null, precioExcedido: true });
  });
});
