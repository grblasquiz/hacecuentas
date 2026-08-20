import { describe, expect, it } from 'vitest';
import { cleanPrimaryKeyword, inferSearchIntent, keywordAlignment, resolveSearchTarget } from '../src/lib/search-target';

describe('search target contract', () => {
  it('removes the brand and editorial tail from the primary keyword', () => {
    expect(cleanPrimaryKeyword('Calculadora de aguinaldo 2026 | Hacé Cuentas')).toBe('Calculadora de aguinaldo 2026');
    expect(cleanPrimaryKeyword('Monotributo 2026: categorías, topes y cuotas')).toBe('Monotributo 2026');
    expect(cleanPrimaryKeyword('Cuánta plata necesito para alquilar — depósito y comisión')).toBe('Cuánta plata necesito para alquilar');
  });

  it('classifies task intent before generic informational intent', () => {
    expect(inferSearchIntent({ path: '/calculadora-imc', title: 'Calculadora de IMC', pageType: 'calculator' })).toBe('calculo');
    expect(inferSearchIntent({ path: '/auto/auto-o-uber', title: '¿Auto o Uber: qué conviene?' })).toBe('comparacion-comercial');
    expect(inferSearchIntent({ path: '/blog/como-calcular-porcentajes', title: 'Cómo calcular porcentajes' })).toBe('calculo');
    expect(inferSearchIntent({ path: '/alquiler', title: 'Entrar a un alquiler', description: 'Calculá depósito y comisión', pageType: 'hub' })).toBe('calculo');
  });

  it('honours explicit targets and measures H1 alignment', () => {
    const target = resolveSearchTarget({ path: '/x', title: 'Otro título', primaryKeyword: 'costo de tener auto', searchIntent: 'comparacion-comercial' });
    expect(target.source).toBe('explicit');
    expect(target.primaryKeyword).toBe('costo de tener auto');
    expect(keywordAlignment(target.primaryKeyword, 'Tu auto cuesta incluso estacionado')).toBeCloseTo(1 / 3);
  });
});
