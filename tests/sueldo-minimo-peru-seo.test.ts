import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/pages/pe/datos-sueldo-minimo-peru-2026.astro', 'utf8');
const sitemap = readFileSync('scripts/generate-sitemap.ts', 'utf8');

describe('SEO canónico del sueldo mínimo de Perú', () => {
  it('responde la consulta y el valor directamente en title, H1 y descripción', () => {
    expect(source).toContain("const title = 'Sueldo mínimo Perú 2026: S/1.130 al mes'");
    expect(source).toContain('<h1>Sueldo mínimo Perú 2026: S/1.130 al mes</h1>');
    expect(source).toContain('El sueldo mínimo en Perú 2026 es de <strong>S/ 1.130 mensuales</strong>');
  });

  it('da una respuesta útil verificable sobre el neto con ONP', () => {
    expect(source).toContain('S/ 983,10');
    expect(source).toContain('SUNAFIL, 12 de marzo de 2026');
    expect(source).toContain('noticias/1364909-');
  });

  it('conserva un único canonical informativo', () => {
    expect(source).toContain("const PAGE_URL = 'https://hacecuentas.com/pe/datos-sueldo-minimo-peru-2026'");
    expect(source).toContain('canonical="/pe/datos-sueldo-minimo-peru-2026"');
  });

  it('enlaza hubs peruanos vivos y no orígenes de calculadoras retiradas', () => {
    expect(source).toContain('href="/pe/trabajo/sueldo-neto"');
    expect(source).toContain('href="/pe/trabajo/liquidacion-y-beneficios"');
    expect(source).not.toMatch(/href="\/pe\/calculadora-(?:sueldo-bruto|gratificacion|cts)/);
  });

  it('distribuye sólo el canonical vivo y no revive una calculadora salarial', () => {
    expect(sitemap).toContain("prio('/pe/datos-sueldo-minimo-peru-2026', '0.9', 'weekly')");
    expect(sitemap).not.toMatch(/prio\('\/pe\/calculadora-(?:sueldo|salario)-minimo-peru/);
  });
});
