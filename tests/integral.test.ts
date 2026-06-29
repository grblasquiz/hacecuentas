import { describe, it, expect } from 'vitest';
import { integrate } from '../src/lib/math/integral';

function I(input: string, v = 'x'): string {
  const r = integrate(input, v);
  expect(r.ok, r.error).toBe(true);
  return r.resultText.replace(/\s/g, '');
}

describe('integrales — potencias y constantes', () => {
  it('∫1 dx = x + C', () => expect(I('1')).toContain('x+C'));
  it('∫x dx = x²/2 + C', () => expect(I('x')).toBe('x^2/2+C'));
  it('∫x^2 dx = x³/3 + C', () => expect(I('x^2')).toBe('x^3/3+C'));
  it('∫3x^2 dx = x³ + C', () => {
    // 3 · x³/3 = x³
    const r = integrate('3*x^2');
    expect(r.ok, r.error).toBe(true);
    expect(r.resultText.replace(/\s/g, '')).toContain('x^3');
  });
  it('∫1/x dx = ln|x| + C', () => {
    const r = integrate('1/x');
    expect(r.ok, r.error).toBe(true);
    expect(r.resultText).toContain('ln');
    expect(r.resultText).toContain('x');
  });
  it('polinomio ∫(x^2 + 2x + 1) dx', () => {
    const r = integrate('x^2 + 2x + 1');
    expect(r.ok, r.error).toBe(true);
    expect(r.resultText).toContain('+ C');
    expect(r.resultText.replace(/\s/g, '')).toContain('x^3/3');
  });
});

describe('integrales — funciones y cadena lineal', () => {
  it('∫cos(x) dx = sin(x) + C', () => expect(I('cos(x)')).toContain('sin(x)'));
  it('∫sin(x) dx = -cos(x) + C', () => {
    const r = integrate('sin(x)');
    expect(r.resultText).toContain('cos(x)');
    expect(r.resultText).toContain('-');
  });
  it('∫e^x dx = e^x + C', () => {
    const r = integrate('e^x');
    expect(r.ok, r.error).toBe(true);
    expect(r.resultText.replace(/\s/g, '')).toContain('e^x');
  });
  it('∫sin(2x) dx = -cos(2x)/2 + C (sustitución lineal)', () => {
    const r = integrate('sin(2*x)');
    expect(r.ok, r.error).toBe(true);
    expect(r.resultText).toContain('cos(2·x)');
    expect(r.resultText).toContain('2');
  });
  it('∫(2x+1)^3 dx (potencia con sustitución lineal)', () => {
    const r = integrate('(2*x+1)^3');
    expect(r.ok, r.error).toBe(true);
    expect(r.resultText.replace(/\s/g, '')).toContain('(2·x+1)^4'.replace(/\s/g, ''));
  });
  it('∫√x dx', () => {
    const r = integrate('sqrt(x)');
    expect(r.ok, r.error).toBe(true);
    expect(r.resultText).toContain('+ C');
  });
});

describe('integrales — errores amistosos', () => {
  it('producto de dos funciones de x → error', () => {
    const r = integrate('x*sin(x)');
    expect(r.ok).toBe(false);
    expect(r.error).toBeTruthy();
  });
  it('función con argumento no lineal → error', () => {
    const r = integrate('sin(x^2)');
    expect(r.ok).toBe(false);
  });
  it('entrada vacía → error', () => {
    expect(integrate('').ok).toBe(false);
  });
  it('genera pasos y header', () => {
    const r = integrate('x^2 + 1');
    expect(r.steps.length).toBeGreaterThan(2);
    expect(r.inputMathml).toContain('<math');
    expect(r.resultMathml).toContain('<math');
  });
  it('variable alternativa t', () => {
    expect(I('t^2', 't')).toBe('t^3/3+C');
  });
});
