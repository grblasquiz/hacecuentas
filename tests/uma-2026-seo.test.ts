import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('src/pages/mx/datos-uma-imss-2026.astro', 'utf8');

describe('SEO del valor de la UMA 2026', () => {
  it('responde las consultas principales con los valores en formato mexicano', () => {
    expect(page).toContain("const title = 'UMA 2026 México: $117.31 diaria y $3,566.22 mensual'");
    expect(page).toContain("const description = 'Valor de la UMA 2026: $117.31 diario, $3,566.22 mensual y $42,794.64 anual.");
    expect(page).toContain('<span class="cf-yr">UMA 2026</span>: $117.31 diarios');
    expect(page).not.toContain('$117,31');
    expect(page).not.toContain('$3.566,22');
  });

  it('mantiene canonical y una fecha de revisión reciente', () => {
    expect(page).toContain("const PAGE_URL = 'https://hacecuentas.com/mx/datos-uma-imss-2026'");
    expect(page).toContain('canonical="/mx/datos-uma-imss-2026"');
    const reviewed = page.match(/const ULTIMA_REVISION = '([0-9-]+)'/)?.[1];
    expect(reviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Date.parse(reviewed!)).toBeGreaterThanOrEqual(Date.parse('2026-08-17'));
    expect(Date.parse(reviewed!)).toBeLessThanOrEqual(Date.now());
  });

  it('enlaza las dos publicaciones oficiales que prueban los valores', () => {
    expect(page).toContain('www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/uma/uma2026.pdf');
    expect(page).toContain('dof.gob.mx/nota_detalle.php?codigo=5778072&fecha=09/01/2026');
    expect(page).toContain('href={INEGI_UMA_2026}');
    expect(page).toContain('href={DOF_UMA_2026}');
  });
});
