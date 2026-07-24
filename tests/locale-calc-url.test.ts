import { describe, expect, it } from 'vitest';
import { createLocaleCalcUrl } from '../src/lib/locale-calc-url';

describe('createLocaleCalcUrl', () => {
  const calcUrl = createLocaleCalcUrl('/mx/', [
    { slug: 'calculadora-isr' },
    { slug: 'calculadora-iva' },
  ]);

  it('prefija las calculadoras que existen en la colección local', () => {
    expect(calcUrl({ slug: 'calculadora-isr' })).toBe('/mx/calculadora-isr');
  });

  it('mantiene en la raíz los fallbacks de la colección argentina', () => {
    expect(calcUrl({ slug: 'calculadora-general' })).toBe('/calculadora-general');
  });

  it('normaliza barras para no generar URLs duplicadas o inválidas', () => {
    expect(calcUrl({ slug: '/calculadora-iva/' })).toBe('/mx/calculadora-iva');
  });

  it('rechaza un prefijo vacío', () => {
    expect(() => createLocaleCalcUrl('/', [])).toThrow('localePrefix must not be empty');
  });
});
