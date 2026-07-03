import { describe, it, expect } from 'vitest';
import {
  parseLocaleNumber,
  parseLocaleNumberOr,
  isNumericInput,
  decimalSeparatorFor,
  formatThousands,
} from '../src/lib/format/number';

describe('parseLocaleNumber — formatos de la spec', () => {
  it('acepta los 5 formatos requeridos (es-AR)', () => {
    expect(parseLocaleNumber('1000000')).toBe(1000000);
    expect(parseLocaleNumber('1.000.000')).toBe(1000000);
    expect(parseLocaleNumber('1,000,000')).toBe(1000000);
    expect(parseLocaleNumber('1.000.000,50')).toBe(1000000.5);
    expect(parseLocaleNumber('1000000.50')).toBe(1000000.5);
  });

  it('desambigua por posición del último separador cuando hay ambos', () => {
    // último = "," → decimal
    expect(parseLocaleNumber('1.234.567,89')).toBe(1234567.89);
    // último = "." → decimal (formato US)
    expect(parseLocaleNumber('1,234,567.89')).toBe(1234567.89);
  });

  it('preserva la semántica es-AR del viejo coerce (regresión)', () => {
    // "." como miles, "," como decimal
    expect(parseLocaleNumber('1.500', { locale: 'es-AR' })).toBe(1500);
    expect(parseLocaleNumber('1,5', { locale: 'es-AR' })).toBe(1.5);
    expect(parseLocaleNumber('0,50', { locale: 'es-AR' })).toBe(0.5);
    expect(parseLocaleNumber('3.000.000', { locale: 'es-AR' })).toBe(3000000);
  });

  it('respeta el separador decimal del locale en el caso ambiguo (3 dígitos)', () => {
    // "1.000": en es "." es miles → 1000; en en "." es decimal → 1.0
    expect(parseLocaleNumber('1.000', { locale: 'es-AR' })).toBe(1000);
    expect(parseLocaleNumber('1.000', { locale: 'en-US' })).toBe(1);
    // "1,000": simétrico
    expect(parseLocaleNumber('1,000', { locale: 'es-AR' })).toBe(1);
    expect(parseLocaleNumber('1,000', { locale: 'en-US' })).toBe(1000);
  });

  it('tolera moneda, unidades, espacios y NBSP', () => {
    expect(parseLocaleNumber('$1.234,50')).toBe(1234.5);
    expect(parseLocaleNumber('1.234,5 kg')).toBe(1234.5);
    expect(parseLocaleNumber('50%')).toBe(50);
    expect(parseLocaleNumber('$ 1.000.000')).toBe(1000000); // NBSP
    expect(parseLocaleNumber('  42  ')).toBe(42);
  });

  it('maneja negativos', () => {
    expect(parseLocaleNumber('-1.234,5')).toBe(-1234.5);
    expect(parseLocaleNumber('-5')).toBe(-5);
    expect(parseLocaleNumber('−7', { locale: 'es-AR' })).toBe(-7); // signo menos Unicode
  });

  it('devuelve un number tal cual si ya es number', () => {
    expect(parseLocaleNumber(1234.5)).toBe(1234.5);
    expect(parseLocaleNumber(0)).toBe(0);
  });

  it('devuelve NaN ante entradas no numéricas', () => {
    expect(Number.isNaN(parseLocaleNumber(''))).toBe(true);
    expect(Number.isNaN(parseLocaleNumber('abc'))).toBe(true);
    expect(Number.isNaN(parseLocaleNumber(null))).toBe(true);
    expect(Number.isNaN(parseLocaleNumber(undefined))).toBe(true);
    expect(Number.isNaN(parseLocaleNumber('.,'))).toBe(true);
  });

  it('decimales sin parte entera', () => {
    expect(parseLocaleNumber(',5', { locale: 'es-AR' })).toBe(0.5);
    expect(parseLocaleNumber('.5', { locale: 'en-US' })).toBe(0.5);
  });
});

describe('parseLocaleNumberOr / isNumericInput', () => {
  it('usa el fallback ante inválidos', () => {
    expect(parseLocaleNumberOr('abc', 0)).toBe(0);
    expect(parseLocaleNumberOr('1.234,5', 0)).toBe(1234.5);
    expect(parseLocaleNumberOr('', null)).toBe(null);
  });
  it('valida', () => {
    expect(isNumericInput('1.234,5')).toBe(true);
    expect(isNumericInput('hola')).toBe(false);
  });
});

describe('decimalSeparatorFor', () => {
  it('en → punto; el resto → coma', () => {
    expect(decimalSeparatorFor('en')).toBe('.');
    expect(decimalSeparatorFor('en-US')).toBe('.');
    expect(decimalSeparatorFor('es-AR')).toBe(',');
    expect(decimalSeparatorFor('pt-BR')).toBe(',');
    expect(decimalSeparatorFor()).toBe(',');
  });
});

describe('formatThousands — round-trip con parseLocaleNumber', () => {
  it('formatea es-AR y en-US', () => {
    expect(formatThousands(1000000, { locale: 'es-AR' })).toBe('1.000.000');
    expect(formatThousands(1234567.89, { locale: 'es-AR', decimals: 2 })).toBe('1.234.567,89');
    expect(formatThousands(1000000, { locale: 'en-US' })).toBe('1,000,000');
  });
  it('round-trip: parse(format(x)) === x', () => {
    for (const x of [0, 5, 1000, 1234.5, 1000000, 9999999.99]) {
      const s = formatThousands(x, { locale: 'es-AR', decimals: x % 1 ? 2 : 0 });
      expect(parseLocaleNumber(s, { locale: 'es-AR' })).toBe(x);
    }
  });
});
