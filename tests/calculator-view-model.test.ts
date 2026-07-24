import { describe, expect, it } from 'vitest';
import {
  calculatorColumnCopy,
  groupCalculatorFields,
  initialHiddenFieldIds,
  isNeutralSpanishPath,
  neutralizeSpanish,
} from '../src/lib/calculator-view-model';

describe('calculator view model', () => {
  it('distingue español neutro del rioplatense por ruta', () => {
    expect(isNeutralSpanishPath('es', '/mx/calculadora-isr')).toBe(true);
    expect(isNeutralSpanishPath('es', '/calculadora-aguinaldo')).toBe(false);
    expect(isNeutralSpanishPath('en', '/mx/calculator')).toBe(false);
    expect(calculatorColumnCopy('es', true).input).toBe('Ingresa tus datos');
    expect(calculatorColumnCopy('es', false).input).toBe('Ingresá tus datos');
  });

  it('neutraliza el disclaimer sin tocar otras palabras', () => {
    expect(neutralizeSpanish('Verificá y consultá; usá la fuente y revisá.'))
      .toBe('verifica y consulta; usa la fuente y revisa.');
  });

  it('agrupa campos preservando el orden original', () => {
    const fields = [
      { id: 'a', group: 'Ingresos', groupIcon: '💰' },
      { id: 'b' },
      { id: 'c', group: 'Ingresos' },
    ];
    expect(groupCalculatorFields(fields)).toEqual([
      { name: 'Ingresos', icon: '💰', fields: [fields[0], fields[2]] },
      { name: undefined, icon: undefined, fields: [fields[1]] },
    ]);
  });

  it('calcula visibilidad condicional desde los defaults SSR', () => {
    const hidden = initialHiddenFieldIds([
      { id: 'tipo', default: 'empleado' },
      { id: 'sueldo', showWhen: { field: 'tipo', in: ['empleado'] } },
      { id: 'ventas', showWhen: { field: 'tipo', in: ['independiente'] } },
    ]);
    expect([...hidden]).toEqual(['ventas']);
  });
});
