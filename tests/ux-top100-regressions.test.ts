import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { calorEspecificoDeltaT } from '../src/lib/formulas/calor-especifico-delta-t';
import { ladrillosM2 } from '../src/lib/formulas/ladrillos-m2';

describe('regresiones UX del top 100', () => {
  it('no duplica la unidad Joule entre fórmula y output', () => {
    const result = calorEspecificoDeltaT({ m: 1, c: 4186, dt: 80 });
    expect(result.calor).toBe('334880');
    expect(String(result.calor)).not.toMatch(/\bJ\b/);
  });

  it('mantiene tablas y fórmulas flagship dentro del viewport móvil', () => {
    const css = readFileSync('src/styles/calc-flagship.css', 'utf8');
    expect(css).toMatch(/\.cf-tablewrap\s*\{[\s\S]*?max-width:\s*100%/);
    expect(css).toMatch(/\.cf-2col\s*>\s*\*/);
    expect(css).toMatch(/\.cf-formula\s*\{[\s\S]*?overflow-x:\s*auto/);
    expect(css).toMatch(/\.cf-page pre\s*\{[\s\S]*?overflow-x:\s*auto/);
    expect(css).toMatch(/\.cf-dates\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  });

  it('limita contenido V2, código y contexto económico en mobile', () => {
    const css = readFileSync('src/styles/calc-redesign.css', 'utf8');
    expect(css).toMatch(/\.calc-v2\s+\.v2-block\s*\{[^}]*min-width:\s*0/);
    expect(css).toMatch(/\.calc-v2\s+\.live-econ\s*\{[\s\S]*?max-width:\s*100%/);
    expect(css).toMatch(/:where\(pre\)\s*\{[^}]*max-width:\s*100%/);
  });

  it('activa el rediseño focus sin excluir edad exacta', () => {
    const layout = readFileSync('src/components/CalcLayoutV2.astro', 'utf8');
    const css = readFileSync('src/styles/calc-redesign.css', 'utf8');
    const excluded = readFileSync('src/lib/redesign-exclude.ts', 'utf8');
    expect(layout).toContain("focusRedesign && 'calc-focus'");
    expect(css).toMatch(/\.calc-focus\s+\.calc-form\s+\.fields-grid/);
    expect(excluded).not.toMatch(/'calculadora-edad-exacta'/);
  });

  it('respeta 0% de desperdicio en la calculadora de ladrillos', () => {
    const result = ladrillosM2({ m2: 10, tipo: 'hueco_12', desperdicio: 0 });
    expect(result.ladrillos).toBe(160);
    expect(result.desperdicio).toBe(0);
  });
});
