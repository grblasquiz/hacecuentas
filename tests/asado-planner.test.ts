import { describe, it, expect } from 'vitest';
import { compute } from '../src/lib/formulas/asado-kg-por-persona-cortes-tira-vacio-pollo';

const base = { adultos: 10, ninos: 4, intensidad: 'estandar', incluye_pollo: 'si', incluye_achuras: 'si' };

describe('asado planner — backward compatible', () => {
  it('total_kg = 5.5 para 10 adultos + 4 niños estándar (sin cambios)', () => {
    expect(compute(base as any).total_kg).toBe(5.5);
  });
  it('los cortes existentes siguen sumando el total', () => {
    const r = compute(base as any);
    const suma = r.tira_kg + r.vacio_kg + r.pollo_kg + r.achuras_kg
      + (r.chorizo_cant * 100 + r.morcilla_cant * 120) / 1000;
    // tolerancia por redondeo de embutidos a unidades enteras
    expect(Math.abs(suma - r.total_kg)).toBeLessThan(0.25);
  });
  it('0 comensales devuelve total 0 y no rompe', () => {
    const r = compute({ ...base, adultos: 0, ninos: 0 } as any);
    expect(r.total_kg).toBe(0);
  });
});

describe('asado planner — outputs integrales', () => {
  const r = compute(base as any);
  it('carbón ≈ kg de carne, mínimo 3', () => expect(r.carbon_kg).toBe(6));
  it('agua = 0,5 L por comensal', () => expect(r.agua_litros).toBe(7));
  it('provoleta = 1 cada 4 comensales', () => expect(r.provoleta_cant).toBe(4));
  it('bebida con alcohol = 1 L por adulto', () => expect(r.bebida_alcohol_litros).toBe(10));
  it('pan y ensalada positivos con guarniciones', () => {
    expect(r.pan_g).toBeGreaterThan(0);
    expect(r.ensalada_kg).toBeGreaterThan(0);
  });
  it('lista de compras incluye carbón y agua', () => {
    expect(r.lista_compras).toContain('Carbón');
    expect(r.lista_compras).toContain('Agua');
  });
});

describe('asado planner — toggles y presupuesto', () => {
  it('sin guarniciones: pan/ensalada/provoleta en 0', () => {
    const r = compute({ ...base, incluye_guarniciones: 'no' } as any);
    expect(r.pan_g).toBe(0);
    expect(r.ensalada_kg).toBe(0);
    expect(r.provoleta_cant).toBe(0);
  });
  it('sin bebidas: bebidas e hielo en 0 (agua igual se calcula)', () => {
    const r = compute({ ...base, incluye_bebidas: 'no' } as any);
    expect(r.bebida_alcohol_litros).toBe(0);
    expect(r.hielo_kg).toBe(0);
    expect(r.agua_litros).toBe(7);
  });
  it('presupuesto SOLO si se ingresa precio (no inventa precios)', () => {
    expect(compute(base as any).presupuesto_carne).toBe(0);
    const r = compute({ ...base, precio_kg_carne: 5000 } as any);
    expect(r.presupuesto_carne).toBe(27500);
    expect(r.costo_carne_por_persona).toBe(1964);
    expect(r.lista_compras).toContain('Presupuesto');
  });
});
