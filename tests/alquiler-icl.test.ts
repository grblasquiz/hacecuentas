/**
 * Regresiones de precedencia para la calc de actualización de alquiler por ICL.
 *
 * Motivación (bug P0, 2026-07-12): el campo avanzado `coeficienteICL` arrancaba
 * con un default oculto (34,76 = valor bruto del ICL, no un coeficiente) que
 * pisaba el cálculo por fechas y devolvía $16.684.800 (+3.376 %) para el preset
 * anual en vez de ~$642.662 (+33,89 %). El fix quita ese default y hace que los
 * presets limpien el coeficiente, así que el MODO MANUAL sólo aplica cuando el
 * usuario carga un coeficiente explícito.
 *
 * Estas pruebas son tolerantes a refrescos del dataset BCRA (usan rangos +
 * auto-consistencia en vez de golden values exactos), pero fallan fuerte si
 * vuelve la precedencia rota (fechas pisadas por un coeficiente no ingresado).
 *
 * Correr: npm test
 */
import { describe, it, expect } from 'vitest';
import { alquilerIcl } from '../src/lib/formulas/alquiler-icl';

const PRESET_ANUAL = {
  valorActual: 480000,
  diaInicio: '1', mesInicio: '3', anioInicio: '2025',
  diaAjuste: '1', mesAjuste: '3', anioAjuste: '2026',
};

describe('alquilerIcl — precedencia modo fechas vs modo manual (bug P0)', () => {
  it('preset anual SIN coeficiente → modo fechas, ~$642.662 (+~33,9 %), nunca los $16,68M del bug', () => {
    const r = alquilerIcl(PRESET_ANUAL);
    // Modo fechas: hace lookup del ICL en ambas puntas.
    expect(r.iclInicio).toBeGreaterThan(0);
    expect(r.iclActualizacion).toBeGreaterThan(r.iclInicio);
    // Coeficiente anual moderado (~1,34), no el 34,76 del default fantasma.
    expect(r.coeficienteUsado).toBeGreaterThan(1.2);
    expect(r.coeficienteUsado).toBeLessThan(1.5);
    // Resultado en el orden de magnitud correcto.
    expect(r.valorActualizado).toBeGreaterThan(600_000);
    expect(r.valorActualizado).toBeLessThan(700_000);
    // Guardia dura contra el bug: 480.000 × 34,76 = 16.684.800.
    expect(r.valorActualizado).toBeLessThan(1_000_000);
    // Auto-consistencia interna (el monto usa el coeficiente en precisión plena;
    // coeficienteUsado va redondeado a 4 decimales, así que verificamos el delta).
    expect(r.incremento).toBe(r.valorActualizado - 480000);
    // El detalle es el de fechas (no el de "a mano").
    expect(r.detalle).toContain('Coeficiente =');
    expect(r.detalle).not.toContain('a mano');
  });

  it('coeficienteICL = "" (lo que manda el preset limpiado) → modo fechas, no manual', () => {
    const r = alquilerIcl({ ...PRESET_ANUAL, coeficienteICL: '' });
    expect(r.detalle).toContain('Coeficiente =');
    expect(r.detalle).not.toContain('a mano');
    expect(r.valorActualizado).toBeLessThan(1_000_000);
  });

  it('coeficienteICL sólo espacios → se ignora (modo fechas)', () => {
    const r = alquilerIcl({ ...PRESET_ANUAL, coeficienteICL: '   ' });
    expect(r.detalle).toContain('Coeficiente =');
    expect(r.valorActualizado).toBeLessThan(1_000_000);
  });

  it('coeficienteICL explícito (1.3389) → modo manual: 480.000 × 1,3389 = 642.672', () => {
    const r = alquilerIcl({ ...PRESET_ANUAL, coeficienteICL: 1.3389 });
    expect(r.coeficienteUsado).toBe(1.3389);
    expect(r.valorActualizado).toBe(Math.round(480000 * 1.3389)); // 642.672
    expect(r.detalle).toContain('a mano');
    expect(r.coeficienteFmt).toBe('1,3389');
  });

  it('coeficienteFmt siempre string con 4 decimales en formato AR (para la métrica "Coeficiente ICL")', () => {
    const r = alquilerIcl(PRESET_ANUAL);
    expect(typeof r.coeficienteFmt).toBe('string');
    expect(r.coeficienteFmt).toMatch(/^\d+,\d{4}$/);
    // Coincide con el coeficiente numérico redondeado a 4 decimales.
    expect(r.coeficienteFmt).toBe(r.coeficienteUsado.toLocaleString('es-AR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }));
  });
});

describe('alquilerIcl — los 3 presets del mockup dan resultados sanos (modo fechas)', () => {
  it('2 años sin ajustar (mar 2024 → mar 2026), $300.000 → ~$1M (+~234 %)', () => {
    const r = alquilerIcl({
      valorActual: 300000,
      diaInicio: '1', mesInicio: '3', anioInicio: '2024',
      diaAjuste: '1', mesAjuste: '3', anioAjuste: '2026',
    });
    expect(r.coeficienteUsado).toBeGreaterThan(3);
    expect(r.coeficienteUsado).toBeLessThan(3.7);
    expect(r.valorActualizado).toBeGreaterThan(900_000);
    expect(r.valorActualizado).toBeLessThan(1_100_000);
    expect(r.incremento).toBe(r.valorActualizado - 300000);
  });

  it('ajuste semestral (sep 2025 → mar 2026), $350.000 → ~$394k (+~12,7 %)', () => {
    const r = alquilerIcl({
      valorActual: 350000,
      diaInicio: '1', mesInicio: '9', anioInicio: '2025',
      diaAjuste: '1', mesAjuste: '3', anioAjuste: '2026',
    });
    expect(r.coeficienteUsado).toBeGreaterThan(1.05);
    expect(r.coeficienteUsado).toBeLessThan(1.25);
    expect(r.valorActualizado).toBeGreaterThan(360_000);
    expect(r.valorActualizado).toBeLessThan(430_000);
    expect(r.incremento).toBe(r.valorActualizado - 350000);
  });
});
