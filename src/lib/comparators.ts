/**
 * Comparadores "X vs Y" (propuesta #5). Ya existen ~43 comparaciones ricas en
 * src/content/comparaciones/ pero estaban huérfanas (0 calcs linkeaban a ellas).
 * Este helper invierte `relatedCalcs` de cada comparación para, dada una calc,
 * encontrar el comparador relevante y ofrecerlo como gancho de exploración.
 *
 * Resuelto en build desde datos existentes → no toca JSONs de calcs, no mueve
 * el sitemap.
 */
const comparacionModules = import.meta.glob<any>('../content/comparaciones/*.json', { eager: true });
const COMPARACIONES = Object.values(comparacionModules).map((m: any) => m.default || m);

// Index slug-de-calc → primer comparador que la referencia.
const calcToComparator = new Map<string, { slug: string; title: string; heroEmoji?: string }>();
for (const c of COMPARACIONES) {
  for (const calcSlug of c.relatedCalcs || []) {
    if (!calcToComparator.has(calcSlug)) {
      // Título corto: el "A vs B" sin el sufijo de marca/año.
      const shortTitle = String(c.title || c.slug)
        .split('|')[0]
        .replace(/\s*\d{4}.*/, '')
        .trim();
      calcToComparator.set(calcSlug, { slug: c.slug, title: shortTitle, heroEmoji: c.heroEmoji });
    }
  }
}

export interface ComparatorLink {
  slug: string;
  title: string;
  heroEmoji?: string;
}

/** Devuelve el comparador relevante para una calc, o null si no hay. */
export function getComparatorForCalc(slug: string): ComparatorLink | null {
  return calcToComparator.get(slug) || null;
}
