import { describe, expect, it } from 'vitest';
import { evaluarCanjeMillas } from '../src/lib/hubs/millas';

describe('valor de un canje de millas', () => {
  it('conserva centavos de la cotización y de las tasas', () => {
    const resultado = evaluarCanjeMillas(670.50, 120.25, 30_000);
    expect(resultado.ahorroUsd).toBe(550.25);
    expect(resultado.centavosPorMilla).toBeCloseTo(1.8341667);
  });

  it('muestra cuánto cuesta de más el canje si las tasas superan el pasaje', () => {
    const resultado = evaluarCanjeMillas(99.99, 120.25, 10_000);
    expect(resultado.ahorroUsd).toBe(-20.26);
    expect(resultado.centavosPorMilla).toBeCloseTo(-0.2026);
  });
});
