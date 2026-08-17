import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/pages/mundial-2026.astro', 'utf8');
const standingsSource = readFileSync('src/pages/posiciones-mundial-2026.astro', 'utf8');

describe('hub post-torneo del Mundial 2026', () => {
  it('responde la intención de campeón y deriva el resultado del fixture', () => {
    expect(source).toContain('Quién ganó el Mundial 2026');
    expect(source).toContain("fixture.matches.find((match) => match.round === 'Final')");
    expect(source).toContain('{champion} ganó el Mundial 2026');
  });

  it('no vuelve a presentar un catálogo de calculadoras retiradas', () => {
    expect(source).not.toMatch(/content\/calcs|Todas las calculadoras|calculadoras de probabilidades/i);
    expect(source).not.toContain('totalItems');
  });

  it('envía fixture, posiciones y cuadro a páginas canónicas vivas', () => {
    expect(source.match(/href="\/fixture-mundial-2026"/g)?.length).toBeGreaterThanOrEqual(3);
    expect(source).toContain('href="/goleadores-mundial-2026"');
    expect(source).not.toContain('href="/campeon-mundial-2026"');
    expect(source).toContain('href="/posiciones-mundial-2026"');
    expect(standingsSource).toContain('Tabla de posiciones del Mundial 2026');
    expect(standingsSource).toContain('computeStandings(fixture.matches)');
  });
});
