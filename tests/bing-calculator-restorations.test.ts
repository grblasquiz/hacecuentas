import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRUNING_REDIRECTS } from '../src/lib/pruning-redirects';

const restored = [
  '/mx/calculadora-isn-impuesto-sobre-nominas-estado',
  '/mx/calculadora-factor-integracion-salarial-imss-mexico',
  '/es/calculadora-irpf-2026-tramos-espana-nomina',
];

describe('calculadoras restauradas por demanda comprobada en Bing', () => {
  it('no vuelve a convertirlas en redirects de poda', () => {
    for (const path of restored) expect(PRUNING_REDIRECTS[path]).toBeUndefined();
  });

  it('mantiene enlaces contextuales desde los hubs que las habían absorbido', () => {
    const mx = readFileSync('src/pages/mx/trabajo/costo-de-un-empleado.astro', 'utf8');
    const es = readFileSync('src/pages/es/impuestos/irpf-nomina.astro', 'utf8');

    expect(mx).toContain('href="/mx/calculadora-isn-impuesto-sobre-nominas-estado"');
    expect(mx).toContain('href="/mx/calculadora-factor-integracion-salarial-imss-mexico"');
    expect(es).toContain('href="/es/calculadora-irpf-2026-tramos-espana-nomina"');
  });
});
