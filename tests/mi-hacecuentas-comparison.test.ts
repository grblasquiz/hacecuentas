import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../src/pages/mi-hacecuentas.astro', import.meta.url), 'utf8');

describe('Mi Hacé Cuentas — comparación local', () => {
  it('usa los cálculos guardados existentes y limita la selección a tres', () => {
    expect(page).toContain("readLS('hc:saved-calcs')");
    expect(page).toContain('selected.length >= 3');
    expect(page).toContain('Comparar cálculos guardados');
  });

  it('no envía resultados a servicios externos', () => {
    const start = page.indexOf('function renderSavedComparison()');
    const end = page.indexOf('// ── 6 · Badges', start);
    const implementation = page.slice(start, end);
    expect(implementation).not.toContain('fetch(');
    expect(implementation).not.toContain('hcTrack');
    expect(implementation).not.toContain('gtag');
  });
});
