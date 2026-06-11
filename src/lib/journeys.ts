/**
 * Journeys: el "próximo paso lógico" de una calc, derivado de fuentes YA
 * curadas (clusters temáticos + secciones de guías-pilar), NO de similitud
 * de categoría. Alimenta dos superficies:
 *   - "Tu próximo paso" post-resultado (componente NextStep, propuesta #1)
 *   - Las calcs relacionadas del pie (RelatedCalcs, propuesta #2)
 *
 * Todo se resuelve en build desde datos existentes → no toca JSONs de calcs,
 * no mueve el sitemap.
 */
import { CLUSTERS } from './clusters';
// Fallback final: relacionadas TF-IDF (mismas que usa RelatedCalcs). Cubre las
// ~764 calcs sin cluster ni sección de guía, que antes quedaban sin "próximo
// paso" (dead-end post-resultado). slug → string[] de slugs afines.
import relatedAuto from './related-auto.json';
const RELATED_AUTO = relatedAuto as Record<string, string[]>;

// Secciones de guías: cada sección agrupa calcs que son un recorrido real.
const guideModules = import.meta.glob<any>('../content/guias/*.json', { eager: true });
const GUIDES = Object.values(guideModules).map((m: any) => m.default || m);

// Index slug → hermanos de su sección de guía (mismo recorrido temático).
const guideSectionSiblings = new Map<string, string[]>();
for (const g of GUIDES) {
  for (const sec of g.sections || []) {
    const calcs: string[] = sec.calcs || [];
    for (const slug of calcs) {
      const prev = guideSectionSiblings.get(slug) || [];
      guideSectionSiblings.set(slug, prev.concat(calcs.filter((s) => s !== slug)));
    }
  }
}

// Index slug → hermanos de su cluster.
const clusterSiblings = new Map<string, string[]>();
for (const c of Object.values(CLUSTERS)) {
  const slugs = c.items.map((i) => i.slug);
  for (const slug of slugs) {
    clusterSiblings.set(slug, slugs.filter((s) => s !== slug));
  }
}

/**
 * Próximos pasos de una calc, en orden de relevancia de recorrido:
 *   1. hermanos de cluster (lo más afín — mismo mini-tema curado)
 *   2. hermanos de sección de guía (mismo paso del journey)
 *   3. relatedSlugs manuales del JSON
 *   4. relacionadas TF-IDF (related-auto.json) — fallback para que casi ninguna
 *      calc quede sin próximo paso. Menor calidad de "recorrido" que 1-2 pero
 *      mejor que un dead-end.
 * Deduplicado y sin la propia calc. Devuelve [] si no hay recorrido conocido.
 */
export function getJourneySteps(slug: string, manualRelated: string[] = [], max = 6): string[] {
  const out: string[] = [];
  const seen = new Set<string>([slug]);
  const push = (s: string) => {
    if (s && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  };
  (clusterSiblings.get(slug) || []).forEach(push);
  (guideSectionSiblings.get(slug) || []).forEach(push);
  manualRelated.forEach(push);
  // Sólo completar con TF-IDF si lo curado no alcanzó el mínimo útil (2 ítems).
  if (out.length < 2) (RELATED_AUTO[slug] || []).forEach(push);
  return out.slice(0, max);
}

/** Categorías donde NO se muestra "Tu próximo paso" (YMYL: dinero y salud). */
export const NEXT_STEP_EXCLUDED = new Set<string>([
  'salud',
  'deportes',
  'finanzas',
  'negocios',
  'marketing',
]);
