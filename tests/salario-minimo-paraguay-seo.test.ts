import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const hub = readFileSync('src/lib/hubs/py/sueldo-neto.ts', 'utf8');
const experience = readFileSync('src/components/generated/SueldoNetoParaguayExperience.astro', 'utf8');
const page = readFileSync('src/pages/py/trabajo/sueldo-neto.astro', 'utf8');
const sitemap = readFileSync('scripts/generate-sitemap.ts', 'utf8');
const redirects = readFileSync('src/lib/pruning-redirects.ts', 'utf8');

describe('SEO canónico del salario mínimo de Paraguay', () => {
  it('responde la consulta y el importe en title, H1 y descripción', () => {
    expect(hub).toContain("title: 'Salario mínimo Paraguay 2026: jornal diario y sueldo neto'");
    expect(hub).toContain('El salario mínimo en Paraguay 2026 es Gs. 3.044.000 al mes');
    expect(experience).toContain('<h1>Salario mínimo Paraguay 2026: Gs. 3.044.000</h1>');
    expect(experience).toContain('el mínimo queda en aproximadamente Gs. 2.770.040 en mano');
  });

  it('cita la actualización oficial del MTESS y declara frescura', () => {
    expect(hub).toContain('https://www.mtess.gov.py/?p=36166');
    expect(hub).toMatch(/lastReviewed: '2026-\d{2}-\d{2}'/);
    expect(page).toContain('dateModified: hub.lastReviewed');
  });

  it('mantiene muerto el alias y concentra señales en el hub vivo', () => {
    expect(redirects).toContain("'/py/salario-minimo-paraguay-2026': '/py/trabajo/sueldo-neto'");
    expect(sitemap).toContain("prio('/py/trabajo/sueldo-neto', '0.9', 'weekly')");
    expect(sitemap).not.toContain("prio('/py/salario-minimo-paraguay-2026'");
  });

  it('usa un único canonical del hub', () => {
    expect(page).toContain("const CANONICAL = `https://hacecuentas.com/${hub.slug}`");
    expect(page).toContain('canonical={CANONICAL}');
  });
});
