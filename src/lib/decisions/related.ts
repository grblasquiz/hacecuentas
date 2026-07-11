/**
 * "Decisiones relacionadas" — cross-linking sala→sala (autoridad interna).
 *
 * Las room pages sólo mostraban `siblings` del hub primario (máx 6, y SOLO si la
 * sala pertenece a uno de los 4 hubs). Las salas de auto/viajes/familia/ahorro y
 * cualquiera sin hub quedaban huérfanas de links laterales — el peor escenario
 * para que una sección nueva rankee: sin densidad de enlaces internos ni señal
 * de clúster temático.
 *
 * Este módulo calcula, para CADA sala, las N más cercanas por afinidad temática,
 * usando sólo metadata pura (DECISION_MANIFEST) — sin arrastrar las fórmulas.
 * Señales de afinidad (de más a menos fuerte):
 *   1. Calcs componentes compartidas → dos salas que usan la misma calculadora
 *      hablan del mismo tema (sueldo, hipoteca, deuda…). Señal más específica.
 *   2. Mismo grupo (hub o grupo del índice) → curación humana de vecindad.
 *   3. Misma categoría.
 * Empates: orden estable del manifest (determinístico entre builds → sitemap
 * y diffs limpios).
 *
 * Es TS puro (sin DOM ni .astro): se consume en el server (prerender de la room
 * page) y podría reusarse en scripts de build.
 */

import { DECISION_MANIFEST, type DecisionRoomMeta } from './manifest';
import { DECISION_HUBS, INDEX_EXTRA_GROUPS } from './hubs';

// slug → conjunto de grupos a los que pertenece (hubs + grupos del índice).
const groupsBySlug: Map<string, Set<string>> = (() => {
  const m = new Map<string, Set<string>>();
  const add = (slug: string, group: string) => {
    let s = m.get(slug);
    if (!s) m.set(slug, (s = new Set()));
    s.add(group);
  };
  for (const h of DECISION_HUBS) for (const s of h.roomSlugs) add(s, `hub:${h.slug}`);
  for (const g of INDEX_EXTRA_GROUPS) for (const s of g.roomSlugs) add(s, `grp:${g.title}`);
  return m;
})();

const calcsBySlug: Map<string, Set<string>> = new Map(
  DECISION_MANIFEST.map((r) => [r.slug, new Set(r.componentCalcs.map((c) => c.slug))]),
);

// Índice de posición en el manifest para desempate estable.
const orderBySlug: Map<string, number> = new Map(DECISION_MANIFEST.map((r, i) => [r.slug, i]));

function affinity(a: DecisionRoomMeta, b: DecisionRoomMeta): number {
  let score = 0;

  // 1. Calcs componentes compartidas (señal más fuerte).
  const ca = calcsBySlug.get(a.slug);
  const cb = calcsBySlug.get(b.slug);
  if (ca && cb) {
    let shared = 0;
    for (const c of ca) if (cb.has(c)) shared++;
    score += shared * 5;
  }

  // 2. Grupo compartido (hub o grupo del índice).
  const ga = groupsBySlug.get(a.slug);
  const gb = groupsBySlug.get(b.slug);
  if (ga && gb) {
    for (const g of ga) if (gb.has(g)) { score += 4; break; }
  }

  // 3. Misma categoría.
  if (a.category && a.category === b.category) score += 2;

  return score;
}

/**
 * Salas relacionadas a `slug`, ordenadas por afinidad (desc) y orden de manifest.
 * Siempre devuelve hasta `limit` (rellena con misma categoría / mismo grupo si la
 * afinidad fuerte no alcanza, para que ninguna sala quede sin bloque). Excluye la
 * propia sala y cualquier slug en `exclude` (p.ej. los siblings del hub ya
 * mostrados, para no repetir enlaces).
 */
export function relatedRooms(slug: string, limit = 6, exclude: string[] = []): DecisionRoomMeta[] {
  const self = DECISION_MANIFEST.find((r) => r.slug === slug);
  if (!self) return [];
  const skip = new Set<string>([slug, ...exclude]);

  const scored = DECISION_MANIFEST.filter((r) => !skip.has(r.slug))
    .map((r) => ({ r, score: affinity(self, r) }))
    .sort(
      (x, y) =>
        y.score - x.score ||
        (orderBySlug.get(x.r.slug)! - orderBySlug.get(y.r.slug)!),
    );

  return scored.slice(0, limit).map((x) => x.r);
}
