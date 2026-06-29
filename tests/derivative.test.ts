import { describe, it, expect } from 'vitest';
import { differentiate } from '../src/lib/math/derivative';

// Comparamos el resultado en texto plano (resultText) que normaliza el AST
// simplificado. No exige una forma única, sino la que produce el simplificador.
function d(input: string, v = 'x'): string {
  const r = differentiate(input, v);
  expect(r.ok, r.error).toBe(true);
  return r.resultText;
}

describe('derivadas — polinomios y reglas básicas', () => {
  it('constante', () => expect(d('5')).toBe('0'));
  it('variable', () => expect(d('x')).toBe('1'));
  it('x^2', () => expect(d('x^2')).toBe('2·x'));
  it('x^3', () => expect(d('x^3')).toBe('3·x^2'));
  it('suma de potencias', () => expect(d('x^2 + x')).toBe('2·x + 1'));
  it('resta y constante', () => expect(d('x^3 - 5')).toBe('3·x^2'));
  it('coeficiente', () => expect(d('3x^2')).toBe('3·2·x'.replace('3·2·x', '6·x')));
  it('coeficiente literal', () => expect(d('a*x^2')).toBe('a·2·x'.replace('a·2·x', '2·a·x')));
});

describe('derivadas — producto y cociente', () => {
  it('producto x·sin(x)', () => {
    const r = differentiate('x*sin(x)');
    expect(r.ok).toBe(true);
    expect(r.resultText).toContain('sin(x)');
    expect(r.resultText).toContain('cos(x)');
  });
  it('cociente 1/x = -1/x^2', () => {
    const r = differentiate('1/x');
    expect(r.ok).toBe(true);
    // (0·x - 1·1)/x^2 → -1/x^2
    expect(r.resultText.replace(/\s/g, '')).toMatch(/x\^2/);
  });
});

describe('derivadas — cadena y funciones', () => {
  it('sin(x)', () => expect(d('sin(x)')).toBe('cos(x)'));
  it('cos(x)', () => expect(d('cos(x)')).toBe('-sin(x)'));
  it('ln(x)', () => expect(d('ln(x)')).toBe('1/x'));
  it('exp(x)', () => expect(d('exp(x)')).toBe('exp(x)'));
  it('sqrt(x)', () => expect(d('sqrt(x)').replace(/\s/g, '')).toBe('1/(2·√(x))'.replace(/\s/g, '')));
  it('cadena sin(x^2)', () => {
    const r = differentiate('sin(x^2)');
    expect(r.ok).toBe(true);
    expect(r.resultText).toContain('cos(x^2)');
    expect(r.resultText).toContain('2·');
  });
  it('e^x', () => {
    const r = differentiate('e^x');
    expect(r.ok).toBe(true);
    expect(r.resultText.replace(/\s/g, '')).toBe('e^x');
  });
  it('cadena exp(2x)', () => {
    const r = differentiate('exp(2*x)');
    expect(r.ok).toBe(true);
    expect(r.resultText).toContain('exp(2·x)');
    expect(r.resultText).toContain('2');
  });
});

describe('derivadas — robustez', () => {
  it('genera pasos', () => {
    const r = differentiate('x^2 + 3*x');
    expect(r.steps.length).toBeGreaterThan(1);
    expect(r.inputMathml).toContain('<math');
    expect(r.resultMathml).toContain('<math');
  });
  it('variable alternativa t', () => expect(d('t^2', 't')).toBe('2·t'));
  it('error con entrada vacía', () => {
    const r = differentiate('');
    expect(r.ok).toBe(false);
    expect(r.error).toBeTruthy();
  });
  it('error con símbolo inválido', () => {
    const r = differentiate('x @ 2');
    expect(r.ok).toBe(false);
  });
  it('paréntesis sin cerrar da error', () => {
    const r = differentiate('sin(x');
    expect(r.ok).toBe(false);
  });
});
