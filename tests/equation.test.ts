import { describe, it, expect } from 'vitest';
import { solveEquation } from '../src/lib/math/equation';

function solve(input: string, v = 'x') {
  return solveEquation(input, v);
}

describe('ecuaciones lineales', () => {
  it('2x + 3 = 7  →  x = 2', () => {
    const r = solve('2x + 3 = 7');
    expect(r.ok, r.error).toBe(true);
    expect(r.resultText).toBe('x = 2');
  });
  it('x - 5 = 0  →  x = 5', () => {
    expect(solve('x - 5 = 0').resultText).toBe('x = 5');
  });
  it('3x = 9  →  x = 3', () => {
    expect(solve('3x = 9').resultText).toBe('x = 3');
  });
  it('solución fraccionaria 2x + 1 = 0  →  x = -0.5', () => {
    expect(solve('2x + 1 = 0').resultText).toBe('x = -0.5');
  });
  it('sin "=" se asume = 0:  2x - 8  →  x = 4', () => {
    expect(solve('2x - 8').resultText).toBe('x = 4');
  });
  it('variable t', () => {
    expect(solve('3t - 6 = 0', 't').resultText).toBe('t = 2');
  });
});

describe('ecuaciones cuadráticas', () => {
  it('x² - 5x + 6 = 0  →  x₁=3, x₂=2', () => {
    const r = solve('x^2 - 5x + 6 = 0');
    expect(r.ok, r.error).toBe(true);
    expect(r.resultText).toBe('x₁ = 3, x₂ = 2');
  });
  it('x² - 4 = 0  →  x₁=2, x₂=-2', () => {
    expect(solve('x^2 - 4 = 0').resultText).toBe('x₁ = 2, x₂ = -2');
  });
  it('raíz doble x² - 6x + 9 = 0  →  x = 3', () => {
    const r = solve('x^2 - 6x + 9 = 0');
    expect(r.resultText).toContain('x = 3');
    expect(r.resultText).toContain('doble');
  });
  it('discriminante negativo x² + 1 = 0  →  complejas', () => {
    const r = solve('x^2 + 1 = 0');
    expect(r.ok).toBe(true);
    expect(r.resultText).toContain('i');
    expect(r.resultText).toContain('complejas');
  });
  it('con paréntesis (x+1)(x-2) = 0  →  x₁=2, x₂=-1', () => {
    const r = solve('(x+1)*(x-2) = 0');
    expect(r.ok, r.error).toBe(true);
    expect(r.resultText).toBe('x₁ = 2, x₂ = -1');
  });
  it('lados con incógnita a ambos: x² = 2x + 3  →  x₁=3, x₂=-1', () => {
    expect(solve('x^2 = 2x + 3').resultText).toBe('x₁ = 3, x₂ = -1');
  });
});

describe('casos límite y errores', () => {
  it('identidad x + 1 = x + 1  →  infinitas', () => {
    const r = solve('x + 1 = x + 1');
    expect(r.ok).toBe(true);
    expect(r.resultText).toContain('Infinitas');
  });
  it('imposible x = x + 1  →  sin solución', () => {
    const r = solve('x = x + 1');
    expect(r.ok).toBe(true);
    expect(r.resultText).toContain('Sin solución');
  });
  it('grado 3 da error amistoso', () => {
    const r = solve('x^3 - 1 = 0');
    expect(r.ok).toBe(false);
    expect(r.error).toContain('grado');
  });
  it('función transcendente da error amistoso', () => {
    const r = solve('sin(x) = 0');
    expect(r.ok).toBe(false);
  });
  it('incógnita en denominador da error', () => {
    const r = solve('1/x = 2');
    expect(r.ok).toBe(false);
  });
  it('genera header y pasos', () => {
    const r = solve('x^2 - 5x + 6 = 0');
    expect(r.headerMathml).toContain('<math');
    expect(r.steps.length).toBeGreaterThan(2);
  });
});
