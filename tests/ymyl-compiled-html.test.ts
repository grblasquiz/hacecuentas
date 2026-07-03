/**
 * YMYL — verificación sobre HTML COMPILADO (dist/). Fase 11/12.
 *
 * Requiere `npm run build` previo (lee dist/client). Si dist no existe, los
 * tests se saltan con aviso (no fallan en un `npm test` sin build).
 *
 * Cubre los criterios de aceptación:
 *   - Ninguna página de salud contiene "Fórmula revisada por Martín Rodríguez"
 *     ni "Revisado por Martín Rodríguez" (texto renderizado, sin tags).
 *   - Cada página restringida: noindex,follow; sin widget (cálculo prescriptivo
 *     desactivado); sin AdSense; sin exportar/email/compartir/embed; fuera de
 *     sitemap, search-index y relacionados.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { isRestrictedCalc } from '../src/lib/content-policy.ts';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist/client');
const hasDist = existsSync(DIST);

function strip(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}
function distHtml(slug: string, en: boolean): string | null {
  const p = join(DIST, en ? 'en' : '', `${slug}.html`);
  return existsSync(p) ? readFileSync(p, 'utf8') : null;
}

// Restringidas reales, computadas desde el contenido.
function restrictedList(): Array<{ slug: string; en: boolean }> {
  const out: Array<{ slug: string; en: boolean }> = [];
  for (const [d, en] of [['calcs', false], ['calcs-en', true]] as const) {
    const dir = join(ROOT, 'src/content', d);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.json')) continue;
      let c: any;
      try { c = JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch { continue; }
      if (isRestrictedCalc(c)) out.push({ slug: c.slug, en });
    }
  }
  return out;
}

const FORBIDDEN_BYLINE = ['Fórmula revisada por Martín Rodríguez', 'Revisado por Martín Rodríguez'];

describe.skipIf(!hasDist)('YMYL compiled — byline site-wide', () => {
  // Muestra de páginas de salud + una normal de finanzas (site-wide).
  const HEALTH_PAGES = [
    'calculadora-imc', 'calculadora-indice-masa-corporal-pediatrico',
    'calculadora-magnesio-glicinato-vs-citrato-vs-malato-dosis',
  ];
  const NORMAL_PAGE = 'calculadora-aguinaldo-sac';

  it('ninguna página de salud contiene "Fórmula revisada por / Revisado por Martín Rodríguez"', () => {
    for (const slug of HEALTH_PAGES) {
      const html = distHtml(slug, false);
      if (!html) continue;
      const text = strip(html);
      for (const phrase of FORBIDDEN_BYLINE) {
        expect(text.includes(phrase), `${slug} contiene "${phrase}"`).toBe(false);
      }
    }
  });

  it('una calc normal (finanzas) tampoco dice "Fórmula revisada por Martín"', () => {
    const html = distHtml(NORMAL_PAGE, false);
    if (html) expect(strip(html).includes('Fórmula revisada por Martín Rodríguez')).toBe(false);
  });
});

describe.skipIf(!hasDist)('YMYL compiled — cada restringida bloqueada', () => {
  const restricted = restrictedList();
  const sitemaps = existsSync(join(ROOT, 'public'))
    ? readdirSync(join(ROOT, 'public')).filter((f) => f.startsWith('sitemap') && f.endsWith('.xml')).map((f) => join(ROOT, 'public', f))
    : [];
  const searchIdx = join(ROOT, 'public/search-index.json');
  const relatedAuto = join(ROOT, 'src/lib/related-auto.json');
  const relatedAutoEn = join(ROOT, 'src/lib/related-auto-en.json');

  it(`hay restringidas para testear (${restricted.length})`, () => {
    expect(restricted.length).toBeGreaterThan(0);
  });

  for (const { slug, en } of restricted) {
    const label = (en ? '/en/' : '/') + slug;
    it(`${label} — noindex, sin widget/ads/export/embed y fuera de canales`, () => {
      const html = distHtml(slug, en);
      expect(html, `falta HTML compilado de ${label}`).not.toBeNull();
      if (!html) return;

      // 1) noindex,follow
      expect(/name="robots" content="noindex, follow"/.test(html), `${label} robots`).toBe(true);
      // 2) cálculo prescriptivo desactivado (no widget interactivo)
      expect(html.includes('class="calc-container"'), `${label} widget presente`).toBe(false);
      // 3) sin AdSense
      expect(html.includes('adsbygoogle.js'), `${label} carga AdSense`).toBe(false);
      // 4) sin exportar/email/compartir (viven en el widget, ausente)
      expect(/data-action="(share|whatsapp|copy|embed|copyLink)"/.test(html), `${label} botones share`).toBe(false);
      expect(html.includes('data-email-form'), `${label} email form`).toBe(false);
      // 5) sin byline prohibido
      const text = strip(html);
      for (const phrase of FORBIDDEN_BYLINE) {
        expect(text.includes(phrase), `${label} byline "${phrase}"`).toBe(false);
      }
      // 6) aviso presente
      expect(html.includes('Herramienta temporalmente limitada'), `${label} sin aviso`).toBe(true);

      // 7) fuera de sitemaps
      for (const sm of sitemaps) {
        const t = readFileSync(sm, 'utf8');
        expect(t.includes(`/${slug}<`) || t.includes(`/${slug}</loc>`), `${label} en ${sm}`).toBe(false);
      }
      // 8) fuera de search-index
      if (existsSync(searchIdx)) {
        expect(readFileSync(searchIdx, 'utf8').includes(`"${slug}"`), `${label} en search-index`).toBe(false);
      }
      // 9) fuera de relacionados (auto)
      for (const ra of [relatedAuto, relatedAutoEn]) {
        if (existsSync(ra)) {
          expect(readFileSync(ra, 'utf8').includes(`"${slug}"`), `${label} en ${ra}`).toBe(false);
        }
      }
      // 10) embed restringido → sin calculadora
      const emb = join(DIST, 'embed', en ? 'en' : '', `${slug}.html`);
      if (existsSync(emb)) {
        const e = readFileSync(emb, 'utf8');
        expect(e.includes('no está disponible para embeber'), `${label} embed disponible`).toBe(true);
        expect(e.includes('class="calc-container"'), `${label} embed con widget`).toBe(false);
      }
    });
  }
});
