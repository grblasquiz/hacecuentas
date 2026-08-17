import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/pages/co/datos-salario-minimo-colombia-2026.astro', 'utf8');
const sitemap = readFileSync('scripts/generate-sitemap.ts', 'utf8');

describe('SEO canónico del salario mínimo de Colombia', () => {
  it('responde la consulta y el valor directamente en title, H1 y primer texto', () => {
    expect(source).toContain("const title = 'Salario mínimo Colombia 2026: $1.750.905 + auxilio'");
    expect(source).toContain('auxilio de transporte: $249.095; total: $2.000.000');
    expect(source).toContain('<h1 class="cf-h1">Salario mínimo Colombia 2026: $1.750.905</h1>');
    expect(source).toContain('el salario mínimo mensual es <strong>$1.750.905</strong>');
  });

  it('respalda también el valor del auxilio con su decreto oficial', () => {
    expect(source).toContain('251230-Decreto-1470-MinTrabajo.pdf');
    expect(source).toContain('Decreto 1470 de 2025 · auxilio de transporte 2026');
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
