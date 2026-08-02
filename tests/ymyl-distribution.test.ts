/** Regresión YMYL adaptada al catálogo de hubs posterior a la migración. */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { isRestrictedCalc, isIndexableCalc, hasValidProfessionalReviewer } from '../src/lib/content-policy.ts';
import computeIndex from '../src/lib/calc-compute-index.json';
import currentTools from '../src/lib/current-tools-index.json';

const ROOT = process.cwd();
const RESTRICTED_LEGACY_SLUGS = [
  'calculadora-magnesio-glicinato-vs-citrato-vs-malato-dosis', 'magnesio-dosis-deficiencia-sintomas',
  'dosis-antipulgas-peso-mascota', 'dosis-mascota', 'dosis-antiparasitario',
  'vitamina-d-dosis-sol-diaria-edad', 'whey-protein-dosis-diaria-scoop', 'creatina-dosis-carga-mantenimiento',
  'cafeina-dosis-segura-diaria-peso', 'cafeina-dosis-rendimiento',
  'calculadora-pubalgia-atletica-tiempo-recuperacion-fases', 'calculadora-tiempo-recuperacion-isquiotibial-grado-1-2-3',
  'alimentacion-complementaria', 'leche-formula-biberon-cantidad-peso-bebe',
];

function fileMentions(path: string, slug: string): boolean {
  return existsSync(path) && readFileSync(path, 'utf8').includes(slug);
}

describe('YMYL — política de restricción', () => {
  it('riesgo alto sin revisor sigue restringido y noindex', () => {
    const fixture = { slug: 'fixture-dosis-sensible', category: 'salud', ymylRisk: 'high', distribution: 'restricted', noindex: true };
    expect(isRestrictedCalc(fixture)).toBe(true);
    expect(isIndexableCalc(fixture)).toBe(false);
    expect(hasValidProfessionalReviewer(fixture)).toBe(false);
  });

  it('los contratos sensibles retirados no reaparecen en REST/MCP ni en el catálogo de hubs', () => {
    const publicSlugs = new Set(currentTools.map((tool) => tool.slug));
    for (const slug of RESTRICTED_LEGACY_SLUGS) {
      expect(computeIndex, `${slug} reapareció en compute`).not.toHaveProperty(slug);
      expect(publicSlugs.has(slug), `${slug} reapareció como hub`).toBe(false);
    }
  });
});

describe('YMYL — exclusión de canales públicos', () => {
  const sitemaps = existsSync(join(ROOT, 'public'))
    ? readdirSync(join(ROOT, 'public')).filter((f) => f.startsWith('sitemap') && f.endsWith('.xml')).map((f) => join(ROOT, 'public', f))
    : [];
  const channels = [
    ...sitemaps,
    join(ROOT, 'public/search-index.json'),
    join(ROOT, 'public/google-page-feed.csv'),
    join(ROOT, 'src/lib/related-auto.json'),
  ];

  it('ninguna herramienta restringida retirada aparece en descubrimiento', () => {
    for (const slug of RESTRICTED_LEGACY_SLUGS) {
      for (const channel of channels) {
        expect(fileMentions(channel, slug), `${slug} en ${channel}`).toBe(false);
      }
    }
  });

  it('una herramienta normal del catálogo actual sigue distribuyéndose', () => {
    expect(currentTools.some((tool) => tool.slug === 'alquiler')).toBe(true);
    expect(isIndexableCalc({ slug: 'alquiler', category: 'alquiler', ymylRisk: 'low' })).toBe(true);
  });
});
