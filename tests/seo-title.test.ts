import { describe, expect, it } from 'vitest';
import { compactSeoTitle, SEO_TITLE_MAX_LENGTH } from '../src/lib/seo-title';

describe('compactSeoTitle', () => {
  it('deja intactos los titles que ya cumplen', () => {
    expect(compactSeoTitle('Calculadora de porcentajes online')).toBe(
      'Calculadora de porcentajes online',
    );
  });

  it('quita la marca final antes de recortar contenido útil', () => {
    const result = compactSeoTitle(
      'Calculadora de consumo de electrodomésticos por mes | Hacé Cuentas',
    );
    // Al soltar la marca el título ya entra en el límite: el contenido útil sobrevive.
    expect(result).toBe('Calculadora de consumo de electrodomésticos por mes');
    expect(result.length).toBeLessThanOrEqual(SEO_TITLE_MAX_LENGTH);
  });

  it('descarta una cláusula secundaria larga desde la derecha', () => {
    const result = compactSeoTitle(
      'Calculadora de finiquito y liquidación en México: cuánto te corresponde',
    );
    // Suelta la cláusula tras ":" y conserva el título principal (con la geo).
    expect(result).toBe('Calculadora de finiquito y liquidación en México');
    expect(result.length).toBeLessThanOrEqual(SEO_TITLE_MAX_LENGTH);
  });

  it('corta por palabra como último recurso y nunca supera el máximo', () => {
    const result = compactSeoTitle(
      'Calculadora extremadamente descriptiva para comparar escenarios financieros internacionales complejos',
    );
    expect(result.length).toBeLessThanOrEqual(SEO_TITLE_MAX_LENGTH);
    expect(result.endsWith(' ')).toBe(false);
  });
});
