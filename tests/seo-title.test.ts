import { describe, expect, it } from 'vitest';
import { compactSeoTitle, SEO_TITLE_MAX_LENGTH } from '../src/lib/seo-title';

describe('compactSeoTitle', () => {
  it('deja intactos los titles que ya cumplen', () => {
    expect(compactSeoTitle('Calculadora de porcentajes online')).toBe(
      'Calculadora de porcentajes online',
    );
  });

  it('quita la marca final antes de recortar contenido útil', () => {
    expect(
      compactSeoTitle(
        'Calculadora de Consumo de Electrodomésticos: cuánto gastan por mes | Hacé Cuentas',
      ),
    ).toBe(
      'Calculadora de Consumo de Electrodomésticos: cuánto gastan por mes',
    );
  });

  it('descarta una cláusula secundaria larga desde la derecha', () => {
    expect(
      compactSeoTitle(
        'Calculadora IMSS e INFONAVIT para trabajadoras del hogar México 2026: cuota mensual del patrón',
      ),
    ).toBe(
      'Calculadora IMSS e INFONAVIT para trabajadoras del hogar México 2026',
    );
  });

  it('corta por palabra como último recurso y nunca supera el máximo', () => {
    const result = compactSeoTitle(
      'Calculadora extremadamente descriptiva para comparar escenarios financieros internacionales complejos',
    );
    expect(result.length).toBeLessThanOrEqual(SEO_TITLE_MAX_LENGTH);
    expect(result.endsWith(' ')).toBe(false);
  });
});
