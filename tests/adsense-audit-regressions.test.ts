import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('regresiones detectadas en la auditoría AdSense', () => {
  it('sirve todos los sitemaps que publica el índice', () => {
    const middleware = read('src/middleware.ts');
    const workerWrapper = read('scripts/generate-worker-wrapper.mjs');
    expect(middleware).toContain("'/sitemap-images.xml'");
    expect(middleware).toContain("'/sitemap-calcs-finanzas.xml'");
    expect(workerWrapper).toContain("'/sitemap-images.xml'");
    expect(workerWrapper).toContain("'/sitemap-calcs-finanzas.xml'");
  });

  it('no conserva los enlaces internos rotos de fechas ni el país undefined', () => {
    const dates = [
      read('src/pages/feriados-2026.astro'),
      read('src/pages/fechas/dias-entre-fechas.astro'),
    ].join('\n');
    expect(dates).not.toContain('/calculadora-dias-habiles-entre-fechas');
    expect(dates).not.toContain('/fechas/dias-habiles');
    expect(dates).not.toContain('/fechas/sumar-dias');

    const chile = read('src/pages/feriados-chile-2026.astro');
    expect(chile).not.toContain("{ href: '/feriados-2026'");
    expect(chile).toContain("{ slug: 'feriados-2026'");
  });

  it('no publica descripciones con cero calculadoras', () => {
    const files = [
      'src/lib/seo-description-overrides.ts',
      'src/pages/calculadoras-evento.astro',
      'src/pages/global/index.astro',
      'src/pages/cl/index.astro',
      'src/pages/py/index.astro',
      'src/pages/ve/index.astro',
    ].map(read).join('\n');
    expect(files).not.toMatch(/(?:Más de )?0 calculadoras/i);
    expect(read('src/pages/calculadoras-evento.astro')).toContain('current-tools-index.json');
  });

  it('mantiene autoría visible y palabras separadas en el título móvil de IMC', () => {
    const imc = read('src/components/ImcExperience.astro');
    expect(imc).toContain('<AuthorByline');
    expect(imc).toContain('tu IMC y <br />conocé tu rango <br />saludable');
  });

  it('deja las páginas de resultados deportivos sin anuncios y con fuente visible', () => {
    const football = [
      read('src/pages/futbol-hoy.astro'),
      read('src/pages/futbol-argentino-hoy.astro'),
      read('src/components/FootballMarketHub.astro'),
    ];
    for (const file of football) expect(file).toContain('noAds={true}');
    for (const file of football) expect(file).toContain('https://www.espn.com/soccer/');
  });
});
