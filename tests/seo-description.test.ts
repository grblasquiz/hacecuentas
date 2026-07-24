import { describe, expect, it } from 'vitest';
import { compactSeoDescription, SEO_DESC_MAX_LENGTH } from '../src/lib/seo-description';

describe('compactSeoDescription', () => {
  it('deja intactas las descriptions que ya entran', () => {
    const d = 'Calculá tu sueldo neto 2026: descuentos de jubilación, obra social y Ganancias, con la escala vigente de AFIP.';
    expect(compactSeoDescription(d)).toBe(d);
  });

  it('normaliza espacios y saltos de línea', () => {
    expect(compactSeoDescription('Calculá  tu\n  sueldo')).toBe('Calculá tu sueldo');
  });

  it('corta en el último fin de frase que entre, sin elipsis', () => {
    const d =
      'Calculá cuánto te descuentan del sueldo bruto en 2026 con las alícuotas vigentes. ' +
      'Incluye jubilación, PAMI y obra social. ' +
      'Además te muestra el impacto de Ganancias mes a mes y la comparación contra el año pasado.';
    const out = compactSeoDescription(d);
    expect(out).toBe(
      'Calculá cuánto te descuentan del sueldo bruto en 2026 con las alícuotas vigentes. Incluye jubilación, PAMI y obra social.',
    );
    expect(out.endsWith('…')).toBe(false);
    expect(out.length).toBeLessThanOrEqual(SEO_DESC_MAX_LENGTH);
  });

  it('cae a corte por palabra con elipsis cuando no hay frase utilizable', () => {
    const d =
      'Conversor de tazas a gramos por ingrediente con harina, azúcar, manteca, cacao, avena, ' +
      'arroz y otros veinte productos de despensa medidos en taza estándar de 240 mililitros';
    const out = compactSeoDescription(d);
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(SEO_DESC_MAX_LENGTH);
    // No corta una palabra por la mitad.
    expect(d.startsWith(out.slice(0, -1))).toBe(true);
  });

  it('no deja conectores colgando al final', () => {
    const d =
      'Calculadora de indemnización por despido sin causa que estima el mes de sueldo por año trabajado, ' +
      'el preaviso y las vacaciones no gozadas según la Ley de Contrato de Trabajo';
    const out = compactSeoDescription(d);
    expect(/\s(de|del|por|para|y|el|la|con)…$/u.test(out)).toBe(false);
  });

  it('nunca supera el techo duro', () => {
    const largo = 'palabra '.repeat(80);
    expect(compactSeoDescription(largo).length).toBeLessThanOrEqual(SEO_DESC_MAX_LENGTH);
  });

  it('tolera vacío y no rompe', () => {
    expect(compactSeoDescription('')).toBe('');
    expect(compactSeoDescription(undefined as unknown as string)).toBe('');
  });
});
