import { describe, expect, it } from 'vitest';
import { classifyDisclaimerDomain, getCalculatorDisclaimer } from '../src/lib/disclaimers';

describe('disclaimers por riesgo real', () => {
  it.each([
    [{ slug: 'licencia-de-conducir', category: 'finanzas' }, 'legal'],
    [{ slug: 'renovar-pasaporte-documentos', category: 'finanzas' }, 'legal'],
    [{ slug: 'calculadora-pintura-paredes', category: 'construccion' }, 'construction-materials'],
    [{ slug: 'porciones-receta', category: 'cocina' }, 'cooking'],
    [{ slug: 'calculadora-iva', category: 'impuestos' }, 'tax'],
    [{ slug: 'rendimiento-cedear', category: 'finanzas' }, 'investment'],
    [{ slug: 'calculadora-fracciones', category: 'matematica' }, 'math'],
  ] as const)('clasifica %o como %s', (calc, expected) => {
    expect(classifyDisclaimerDomain(calc)).toBe(expected);
  });

  it.each([
    { slug: 'licencia-de-conducir', category: 'finanzas' },
    { slug: 'renovar-pasaporte-documentos', category: 'finanzas' },
    { slug: 'calculadora-pintura-paredes', category: 'construccion' },
    { slug: 'porciones-receta', category: 'cocina' },
  ])('no muestra CNV ni contador fuera de inversión/impuestos: $slug', (calc) => {
    expect(getCalculatorDisclaimer(calc, 'es')).not.toMatch(/CNV|contador/i);
  });
});
