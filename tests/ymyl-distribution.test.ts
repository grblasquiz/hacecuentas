/**
 * Regresión YMYL — distribución y restricción (Fases 5-11).
 *
 * Verifica sobre artefactos COMMITEADOS (content JSON + generados en public/ +
 * fuente de generadores) que las calculadoras restringidas:
 *   - están marcadas noindex + restringidas por content-policy,
 *   - NO aparecen en sitemaps, search-index, page-feed ni related-auto,
 *   - las normales siguen distribuyéndose.
 *
 * No requiere build (usa los generados ya commiteados). La verificación de HTML
 * en vivo (data-nosnippet, schema, meta robots) la cubren ymyl-authorship.test
 * y la validación final de Fase 12.
 *
 * Correr: npm test
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  isRestrictedCalc,
  isIndexableCalc,
  hasValidProfessionalReviewer,
} from '../src/lib/content-policy.ts';

const ROOT = process.cwd();
const AR = join(ROOT, 'src/content/calcs');

// La primera tanda restringida (Fase 5). Se resuelven a su slug real.
const BATCH_FILES = [
  'calculadora-magnesio-glicinato-vs-citrato-vs-malato-dosis', 'magnesio-dosis-deficiencia-sintomas',
  'dosis-antipulgas-peso-mascota', 'dosis-mascota', 'dosis-antiparasitario',
  'vitamina-d-dosis-sol-diaria-edad', 'whey-protein-dosis-diaria-scoop', 'creatina-dosis-carga-mantenimiento',
  'cafeina-dosis-segura-diaria-peso', 'cafeina-dosis-rendimiento',
  'calculadora-pubalgia-atletica-tiempo-recuperacion-fases', 'calculadora-tiempo-recuperacion-isquiotibial-grado-1-2-3',
  'alimentacion-complementaria', 'leche-formula-biberon-cantidad-peso-bebe',
];

function loadCalc(file: string): any {
  return JSON.parse(readFileSync(join(AR, `${file}.json`), 'utf8'));
}
const batch = BATCH_FILES.map(loadCalc);
const restrictedSlugs = batch.map((c) => c.slug);

function fileMentions(path: string, slug: string): boolean {
  if (!existsSync(path)) return false;
  const t = readFileSync(path, 'utf8');
  return t.includes('/' + slug) || t.includes('"' + slug + '"') || t.includes('>' + slug + '<');
}

describe('YMYL — clasificación de la tanda restringida', () => {
  it('cada calc de la tanda es ymylRisk:high, restringida y noindex', () => {
    for (const c of batch) {
      expect(c.ymylRisk, `${c.slug} ymylRisk`).toBe('high');
      expect(c.distribution, `${c.slug} distribution`).toBe('restricted');
      expect(c.noindex, `${c.slug} noindex`).toBe(true);
      expect(isRestrictedCalc(c), `${c.slug} isRestrictedCalc`).toBe(true);
      expect(isIndexableCalc(c), `${c.slug} isIndexableCalc`).toBe(false);
      expect(hasValidProfessionalReviewer(c), `${c.slug} sin revisor`).toBe(false);
    }
  });

  it('ninguna calc de la tanda tiene "Resultado de calculadora" en title/description', () => {
    for (const c of batch) {
      expect(String(c.title || '')).not.toContain('Resultado de calculadora');
      expect(String(c.description || '')).not.toContain('Resultado de calculadora');
    }
  });
});

describe('YMYL — exclusión de canales (artefactos commiteados)', () => {
  const sitemaps = existsSync(join(ROOT, 'public'))
    ? readdirSync(join(ROOT, 'public')).filter((f) => f.startsWith('sitemap') && f.endsWith('.xml')).map((f) => join(ROOT, 'public', f))
    : [];

  it('ninguna restringida aparece en ningún sitemap', () => {
    for (const slug of restrictedSlugs) {
      for (const sm of sitemaps) {
        expect(fileMentions(sm, slug), `${slug} en ${sm}`).toBe(false);
      }
    }
  });

  it('ninguna restringida aparece en search-index / page-feed / related-auto', () => {
    const channels = [
      join(ROOT, 'public/search-index.json'),
      join(ROOT, 'public/google-page-feed.csv'),
      join(ROOT, 'src/lib/related-auto.json'),
    ];
    for (const slug of restrictedSlugs) {
      for (const ch of channels) {
        expect(fileMentions(ch, slug), `${slug} en ${ch}`).toBe(false);
      }
    }
  });

  it('los sitemaps no listan ninguna URL de calc noindex', () => {
    // Prueba cruzada: junta todos los slugs noindex del catálogo AR y confirma
    // que ninguno está en los sitemaps (no sólo la tanda).
    const noindexSlugs = readdirSync(AR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => { try { return JSON.parse(readFileSync(join(AR, f), 'utf8')); } catch { return null; } })
      .filter((c: any) => c && (c.noindex === true || isRestrictedCalc(c)))
      .map((c: any) => c.slug);
    let leaks = 0;
    for (const sm of sitemaps) {
      const t = readFileSync(sm, 'utf8');
      for (const slug of noindexSlugs) {
        if (t.includes('/' + slug + '<') || t.includes('/' + slug + '</loc>')) leaks++;
      }
    }
    expect(leaks, 'URLs noindex en sitemaps').toBe(0);
  });
});

describe('YMYL — las calculadoras normales siguen distribuyéndose', () => {
  it('una calc normal (imc.json, slug calculadora-imc) es indexable y está en el search-index', () => {
    const imc = loadCalc('imc'); // filename ≠ slug: imc.json → slug calculadora-imc
    expect(imc.slug).toBe('calculadora-imc');
    expect(isIndexableCalc(imc)).toBe(true);
    const si = join(ROOT, 'public/search-index.json');
    if (existsSync(si)) expect(fileMentions(si, imc.slug)).toBe(true);
  });
});
