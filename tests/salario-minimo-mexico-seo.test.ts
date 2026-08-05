import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/pages/mx/datos-salario-minimo-mexico-2026.astro', 'utf8');
const sitemap = readFileSync('scripts/generate-sitemap.ts', 'utf8');

describe('SEO canónico del salario mínimo de México', () => {
  it('responde la consulta y el valor directamente en title, H1 y descripción', () => {
    expect(source).toContain("const title = 'Salario mínimo México 2026: $315,04 al día'");
    expect(source).toContain('<h1>Salario mínimo México 2026: $315,04 diarios</h1>');
    expect(source).toContain('El salario mínimo en México 2026 es $315,04 diarios');
  });

  it('conserva un único canonical informativo y la fecha de revisión', () => {
    expect(source).toContain("const PAGE_URL = 'https://hacecuentas.com/mx/datos-salario-minimo-mexico-2026'");
    expect(source).toContain('canonical="/mx/datos-salario-minimo-mexico-2026"');
    expect(source).toContain("const ULTIMA_REVISION = '2026-08-04'");
  });

  it('enlaza hubs mexicanos vivos y no calculadoras retiradas', () => {
    expect(source).toContain('href="/mx/trabajo/aguinaldo-prima-y-ptu"');
    expect(source).toContain('href="/mx/trabajo/finiquito-y-liquidacion"');
    expect(source).not.toContain('href="/categoria/finanzas"');
    expect(source).not.toContain('href="/calculadora-finiquito-liquidacion-mexico-2026"');
  });

  it('distribuye sólo el canonical vivo en el sitemap prioritario', () => {
    expect(sitemap).toContain("prio('/mx/datos-salario-minimo-mexico-2026', '0.9', 'weekly')");
    expect(sitemap).not.toMatch(/prio\('\/mx\/calculadora-salario-minimo-mexico/);
  });
});
