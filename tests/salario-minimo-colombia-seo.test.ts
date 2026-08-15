import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/pages/co/datos-salario-minimo-colombia-2026.astro', 'utf8');
const sitemap = readFileSync('scripts/generate-sitemap.ts', 'utf8');

describe('SEO canónico del salario mínimo de Colombia', () => {
  it('responde la consulta y el valor directamente en title, H1 y primer texto', () => {
    expect(source).toContain("const title = 'Salario mínimo Colombia 2026: $1.750.905 y total $2M'");
    expect(source).toContain('<h1 class="cf-h1">Salario mínimo Colombia 2026: $1.750.905</h1>');
    expect(source).toContain('el salario mínimo mensual es <strong>$1.750.905</strong>');
  });

  it('conserva el único canonical de la página-dato viva', () => {
    expect(source).toContain("const PAGE_URL = 'https://hacecuentas.com/co/datos-salario-minimo-colombia-2026'");
    expect(source).toContain('canonical="/co/datos-salario-minimo-colombia-2026"');
  });

  it('no vuelve a enlazar calculadoras retiradas', () => {
    expect(source).not.toContain("href: '/co/calculadora-auxilio-transporte-colombia-2026'");
    expect(source).not.toContain('/co/calculadora-salario-minimo-colombia-2026-auxilio-transporte');
    expect(source).toContain("href: '/co/trabajo/sueldo-neto'");
  });

  it('distribuye el canonical vivo en el sitemap prioritario de Bing', () => {
    expect(sitemap).toContain("prio('/co/datos-salario-minimo-colombia-2026', '0.95', 'weekly')");
    expect(sitemap).not.toMatch(/prio\('\/co\/calculadora-(?:auxilio-transporte|salario-minimo-colombia)/);
  });
});
