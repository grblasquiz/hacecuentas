import { describe, expect, it } from 'vitest';
import { isCalculatorInputError } from '../src/lib/calculator-errors';

describe('isCalculatorInputError', () => {
  it.each([
    'Ingresá la duración del vuelo',
    'El mes final tiene que ser igual o posterior al mes inicial',
    'La nota 12 está fuera del rango válido (0-10)',
    'Formato de hora inválido (HH:MM)',
    'Completá los campos obligatorios',
  ])('clasifica validaciones históricas como input: %s', (message) => {
    expect(isCalculatorInputError(new Error(message))).toBe(true);
  });

  it('mantiene las excepciones técnicas como runtime', () => {
    expect(isCalculatorInputError(new TypeError('Cannot read properties of undefined'))).toBe(false);
  });

  it('respeta los contratos explícitos InputError e INPUT', () => {
    expect(isCalculatorInputError({ name: 'InputError', message: 'x' })).toBe(true);
    expect(isCalculatorInputError({ code: 'INPUT', message: 'x' })).toBe(true);
  });
});
