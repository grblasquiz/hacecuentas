/**
 * audit-cannibalization.ts — Detecta calculadoras que compiten por la misma
 * intención de búsqueda (canibalización). Spec Fase 9.
 *
 * Genera:
 *   - reports/cannibalization-report.json
 *   - reports/cannibalization-report.csv
 *
 * SÓLO reporta. NO crea redirecciones (decisión de seguridad: consolidar es
 * irreversible en SEO; requiere confirmación humana). Los "duplicados exactos"
 * quedan listados como CANDIDATOS a 301, no aplicados.
 *
 * Agrupa por: formulaId, título/H1 normalizados, set de campos, set de outputs,
 * categoría, canonical. Clasifica cada par como:
 *   - exact        (misma intención + misma fórmula + mismos inputs + mismo output)
 *   - same_intent  (misma intención, variaciones menores)
 *   - complementary(tema relacionado, herramientas distintas)
 *   - false_match  (coincidencia superficial)
 *
 * Correr: node --experimental-strip-types scripts/audit-cannibalization.ts
 *         npm run audit:cannibalization
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const AR_DIR = join(ROOT, 'src/content/calcs');
const REPORTS_DIR = join(ROOT, 'reports');

// Temas prioritarios (spec Fase 9): se marcan para revisión primero.
const PRIORITY_TOPICS: Record<string, string[]> = {
  agua_diaria: ['agua', 'hidratacion', 'litros'],
  bmr_tdee: ['bmr', 'tmb', 'tdee', 'metabolismo', 'basal', 'calorias-mantenimiento'],
  calorias: ['calorias', 'deficit', 'calorico'],
  embarazo_parto: ['semanas-embarazo', 'fecha-probable-parto', 'gestacion', 'fpp'],
  pintura_m2: ['pintura', 'litros-pintura', 'metros-cuadrados-pintar'],
  porcentajes: ['porcentaje', 'porciento', 'descuento-porcentaje'],
  regla_de_tres: ['regla-de-tres', 'proporcion'],
  conversiones: ['conversor', 'convertir', 'a-metros', 'a-kg', 'a-litros'],
};

const STOP = new Set([
  'calculadora', 'calcular', 'calculo', 'de', 'la', 'el', 'en', 'y', 'a', 'los', 'del',
  'las', 'un', 'por', 'con', 'para', 'tu', 'mi', 'cuanto', 'como', 'que', 'segun', 'online',
  'gratis', 'hace', 'cuentas', 'argentina', '2026', 'vs',
]);

function norm(s: unknown): string {
  return String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
function tokens(s: unknown): Set<string> {
  return new Set(
    norm(s).replace(/[^a-z0-9\s-]/g, ' ').split(/[\s-]+/).filter((t) => t.length > 2 && !STOP.has(t)),
  );
}
function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size && !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}
function idSet(arr: any): string {
  if (!Array.isArray(arr)) return '';
  return arr.map((x: any) => norm(x?.id)).filter(Boolean).sort().join(',');
}
function priorityTopic(slug: string, title: string): string | null {
  const hay = norm(slug) + ' ' + norm(title);
  for (const [topic, kws] of Object.entries(PRIORITY_TOPICS)) {
    if (kws.some((k) => hay.includes(k))) return topic;
  }
  return null;
}

interface Calc { slug: string; title?: string; h1?: string; category?: string; formulaId?: string;
  fields?: any[]; outputs?: any[]; explanation?: string; canonicalSlug?: string; seoKeywords?: string[]; }

const files = readdirSync(AR_DIR).filter((f) => f.endsWith('.json'));
const calcs: Calc[] = files.map((f) => {
  try { return JSON.parse(readFileSync(join(AR_DIR, f), 'utf8')); } catch { return null; }
}).filter(Boolean) as Calc[];

// Firma de intención por calc.
const sig = new Map<string, { c: Calc; titleTok: Set<string>; intentTok: Set<string>; fields: string; outputs: string; topic: string | null }>();
for (const c of calcs) {
  const titleTok = tokens(`${c.h1 || ''} ${c.title || ''}`);
  const intentTok = new Set<string>([...titleTok, ...tokens((c.seoKeywords || []).join(' ')), ...tokens(c.slug)]);
  sig.set(c.slug, { c, titleTok, intentTok, fields: idSet(c.fields), outputs: idSet(c.outputs), topic: priorityTopic(c.slug, c.title || c.h1 || '') });
}

// Buckets para no comparar O(n²) completo: por formulaId y por token-ancla.
const buckets = new Map<string, string[]>();
const addBucket = (key: string, slug: string) => {
  if (!key) return;
  if (!buckets.has(key)) buckets.set(key, []);
  buckets.get(key)!.push(slug);
};
for (const c of calcs) {
  const s = sig.get(c.slug)!;
  if (c.formulaId) addBucket('f:' + c.formulaId, c.slug);
  // ancla = 2 tokens más largos del título (heurística de "mismo tema")
  const anchors = [...s.titleTok].sort((a, b) => b.length - a.length).slice(0, 2).sort();
  if (anchors.length) addBucket('t:' + anchors.join('|'), c.slug);
  if (s.topic) addBucket('p:' + s.topic, c.slug);
}

type Cls = 'exact' | 'same_intent' | 'complementary' | 'false_match';
interface Pair { a: string; b: string; classification: Cls; titleSim: number; intentSim: number;
  sameFormula: boolean; sameFields: boolean; sameOutputs: boolean; sameCategory: boolean;
  topic: string | null; autoRedirectSafe: boolean; suggestedCanonical: string | null; }

const seenPairs = new Set<string>();
const pairs: Pair[] = [];

function contentScore(c: Calc): number {
  return (Array.isArray((c as any).faq) ? (c as any).faq.length : 0) * 2 +
    (Array.isArray((c as any).useCases) ? (c as any).useCases.length : 0) +
    (c.explanation ? c.explanation.length / 500 : 0) +
    (Array.isArray((c as any).referenceTables) ? (c as any).referenceTables.length * 3 : 0);
}

for (const slugs of buckets.values()) {
  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      const [x, y] = [slugs[i], slugs[j]].sort();
      const key = x + '::' + y;
      if (seenPairs.has(key)) continue;
      seenPairs.add(key);
      const sa = sig.get(x)!, sb = sig.get(y)!;
      const titleSim = jaccard(sa.titleTok, sb.titleTok);
      const intentSim = jaccard(sa.intentTok, sb.intentTok);
      const sameFormula = !!sa.c.formulaId && sa.c.formulaId === sb.c.formulaId;
      const sameFields = !!sa.fields && sa.fields === sb.fields;
      const sameOutputs = !!sa.outputs && sa.outputs === sb.outputs;
      const sameCategory = sa.c.category === sb.c.category;

      // Descarta ruido: sin fórmula compartida y baja similitud → no es par real.
      if (!sameFormula && intentSim < 0.35 && titleSim < 0.4) continue;

      let classification: Cls;
      const exact = sameFormula && sameFields && sameOutputs && sameCategory && titleSim >= 0.55;
      if (exact) classification = 'exact';
      else if ((sameFormula || sameFields) && intentSim >= 0.45) classification = 'same_intent';
      else if (intentSim >= 0.5 || titleSim >= 0.55) classification = 'same_intent';
      else if (sameCategory && intentSim >= 0.35) classification = 'complementary';
      else classification = 'false_match';

      if (classification === 'false_match') continue;

      const topic = sa.topic || sb.topic;
      // Canonical sugerido para exactos: la de más contenido (proxy de autoridad).
      let suggestedCanonical: string | null = null;
      if (classification === 'exact') {
        suggestedCanonical = contentScore(sa.c) >= contentScore(sb.c) ? x : y;
      }
      pairs.push({
        a: x, b: y, classification, titleSim: +titleSim.toFixed(2), intentSim: +intentSim.toFixed(2),
        sameFormula, sameFields, sameOutputs, sameCategory, topic,
        autoRedirectSafe: classification === 'exact',
        suggestedCanonical,
      });
    }
  }
}

// Orden: exactos primero, luego por prioridad de tema, luego por intentSim.
const rank: Record<Cls, number> = { exact: 0, same_intent: 1, complementary: 2, false_match: 3 };
pairs.sort((p, q) => rank[p.classification] - rank[q.classification] ||
  (q.topic ? 1 : 0) - (p.topic ? 1 : 0) || q.intentSim - p.intentSim);

const summary = {
  generatedBy: 'scripts/audit-cannibalization.ts',
  totalCalcs: calcs.length,
  pairs: pairs.length,
  exact: pairs.filter((p) => p.classification === 'exact').length,
  same_intent: pairs.filter((p) => p.classification === 'same_intent').length,
  complementary: pairs.filter((p) => p.classification === 'complementary').length,
  priorityPairs: pairs.filter((p) => p.topic).length,
  note: 'REPORT-ONLY. No se aplicaron redirecciones. Los "exact" son candidatos a 301, requieren confirmación humana.',
};

if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true });
writeFileSync(join(REPORTS_DIR, 'cannibalization-report.json'), JSON.stringify({ summary, pairs }, null, 2), 'utf8');

const csvCell = (v: string) => (/[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
const header = ['classification', 'topic', 'a', 'b', 'suggestedCanonical', 'titleSim', 'intentSim', 'sameFormula', 'sameFields', 'sameOutputs', 'sameCategory', 'autoRedirectSafe'];
const lines = [header.join(',')];
for (const p of pairs) {
  lines.push([p.classification, p.topic || '', p.a, p.b, p.suggestedCanonical || '', String(p.titleSim), String(p.intentSim),
    String(p.sameFormula), String(p.sameFields), String(p.sameOutputs), String(p.sameCategory), String(p.autoRedirectSafe)]
    .map((c) => csvCell(String(c))).join(','));
}
writeFileSync(join(REPORTS_DIR, 'cannibalization-report.csv'), lines.join('\n') + '\n', 'utf8');

console.log('[cannibalization] reports/cannibalization-report.{json,csv}');
console.log(`[cannibalization] pares=${summary.pairs} exact=${summary.exact} same_intent=${summary.same_intent} complementary=${summary.complementary} prioritarios=${summary.priorityPairs}`);
