import { describe, it, expect } from 'vitest';
import { simplifyExpression } from '../src/lib/math/simplify-tool';

function S(input: string): string {
  const r = simplifyExpression(input);
  expect(r.ok, r.error).toBe(true);
  return r.resultText.replace(/\s/g, '');
}

describe('simplificar — agrupar términos semejantes', () => {
  it('2x + 3x = 5x', () => expect(S('2x + 3x')).toBe('5·x'));
  it('x + x + x = 3x', () => expect(S('x + x + x')).toBe('3·x'));
  it('2x + 3 + 5x - 1 = 7x + 2', () => expect(S('2x + 3 + 5x - 1')).toBe('7·x+2'));
  it('x^2 + 2x + 3x^2 = 4x² + 2x', () => expect(S('x^2 + 2x + 3x^2')).toBe('4·x^2+2·x'));
});

describe('simplificar — expandir productos', () => {
  it('(x+1)(x-1) = x² - 1', () => expect(S('(x+1)*(x-1)')).toBe('x^2-1'));
  it('(x+2)^2 = x² + 4x + 4', () => expect(S('(x+2)^2')).toBe('x^2+4·x+4'));
  it('2(x+3) = 2x + 6', () => expect(S('2*(x+3)')).toBe('2·x+6'));
});

describe('simplificar — evaluación numérica', () => {
  it('2 + 3*4 = 14', () => expect(S('2 + 3*4')).toBe('14'));
  it('(5-1)^2 = 16', () => expect(S('(5-1)^2')).toBe('16'));
});

describe('simplificar — autodetección de variable', () => {
  it('detecta a:  2a + 3a = 5a', () => {
    const r = simplifyExpression('2a + 3a');
    expect(r.ok, r.error).toBe(true);
    expect(r.varName).toBe('a');
    expect(r.resultText.replace(/\s/g, '')).toBe('5·a');
  });
  it('detecta t:  t^2 + t^2 = 2t²', () => {
    const r = simplifyExpression('t^2 + t^2');
    expect(r.varName).toBe('t');
    expect(r.resultText.replace(/\s/g, '')).toBe('2·t^2');
  });
});

describe('simplificar — casos no polinómicos', () => {
  it('expresión con función no rompe (devuelve algo)', () => {
    const r = simplifyExpression('sin(x) + 0');
    expect(r.ok).toBe(true);
    expect(r.resultText).toContain('sin(x)');
  });
  it('genera header y pasos', () => {
    const r = simplifyExpression('2x + 3x');
    expect(r.inputMathml).toContain('<math');
    expect(r.steps.length).toBeGreaterThan(1);
  });
});
