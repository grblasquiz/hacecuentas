/**
 * audit:adsense — Auditoría editorial para la solicitud de Google AdSense.
 *
 * Recorre TODAS las calculadoras (raíz + locales), corre el quality gate
 * editorial y clasifica cada URL en KEEP / IMPROVE / MERGE_301 / DRAFT.
 * Genera los reports de reports/ y termina con exit≠0 si alguna página
 * PUBLISHED tiene un bloqueo P0/P1 (para frenar el deploy en CI).
 *
 * NO modifica contenido. Sólo lee y reporta. La decisión de qué es "published"
 * es el quality gate automático (elegido 2026-07): una calc se publica cuando
 * pasa todos los controles duros de acá.
 *
 * Uso:  npm run audit:adsense          (reporta + escribe reports/)
 *       npm run audit:adsense -- --gate (sólo exit code, para CI)
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { PRUNING_REDIRECTS } from '../src/lib/pruning-redirects.ts';
import {
  isRestrictedCalc,
  isPrunedCalc,
  isAdWorthy,
  canAdvertiseCalc,
  hasValidProfessionalReviewer,
} from '../src/lib/content-policy.ts';

const ROOT = new URL('..', import.meta.url).pathname;
const CONTENT = join(ROOT, 'src/content');
const REPORTS = join(ROOT, 'reports');
const TODAY = '2026-07-14'; // fecha de esta auditoría editorial completa

// Locales: carpeta → {lang, country}
const LOCALES: Record<string, { lang: string; country: string; prefix: string }> = {
  'calcs': { lang: 'es', country: 'AR', prefix: '' },
  'calcs-mx': { lang: 'es', country: 'MX', prefix: 'mx' },
  'calcs-co': { lang: 'es', country: 'CO', prefix: 'co' },
  'calcs-cl': { lang: 'es', country: 'CL', prefix: 'cl' },
  'calcs-pe': { lang: 'es', country: 'PE', prefix: 'pe' },
  'calcs-ec': { lang: 'es', country: 'EC', prefix: 'ec' },
  'calcs-ve': { lang: 'es', country: 'VE', prefix: 've' },
  'calcs-py': { lang: 'es', country: 'PY', prefix: 'py' },
  'calcs-uy': { lang: 'es', country: 'UY', prefix: 'uy' },
  'calcs-do': { lang: 'es', country: 'DO', prefix: 'do' },
  'calcs-es': { lang: 'es', country: 'ES', prefix: 'es' },
  'calcs-en': { lang: 'en', country: 'US', prefix: 'en' },
  'calcs-pt': { lang: 'pt', country: 'BR', prefix: 'pt' },
  'calcs-pt-pt': { lang: 'pt', country: 'PT', prefix: 'pt-pt' },
};

// Frases genéricas / restos de plantilla que NO pueden aparecer en publishable (#3).
// Se buscan sobre el JSON serializado. Las 4 últimas son tokens de bug de
// serialización: se buscan con límites para no matchear español legítimo.
const GENERIC_LITERAL = [
  'Resultado de calculadora',
  'fórmula estándar del tema',
  'ingresando consultar',
  'resultado orientativo — para decisiones importantes',
  'texto pendiente',
  'lorem ipsum',
];
const GENERIC_TOKEN = [
  /\[object Object\]/,
  /:\s*"undefined"/,          // un campo con valor literal "undefined"
  /:\s*"null"/,               // valor literal "null" (string)
  /\bNaN\b/,                  // NaN suelto
  /"\s*(?:TODO|FIXME)(?:\s*[:\-—][^"]*)?"/i, // marcador técnico como valor; no confundir el español «TODO»
];

type Decision = 'KEEP' | 'IMPROVE' | 'MERGE_301' | 'DRAFT';
type EditorialState =
  | 'draft'
  | 'automated_tested'
  | 'editorially_reviewed'
  | 'professionally_reviewed'
  | 'published';

interface Row {
  url: string;
  slug: string;
  lang: string;
  country: string;
  category: string;
  editorialState: EditorialState;
  indexable: boolean;
  canonical: string;
  title: string;
  metaDescription: string;
  h1: string;
  words: number;
  wordsBody: number;
  sources: number;
  officialSources: number;
  reviewDate: string;
  dataUpdate: string;
  editor: string;
  professionalReviewer: string;
  fields: number;
  formulaSignature: string;
  formulaType: string;
  primarySource: string;
  primarySourceUrl: string;
  sourceVerified: boolean;
  automatedTests: string;
  adsEligible: boolean;
  quarantineReasons: string[];
  hasTests: boolean;
  ymyl: 'LOW' | 'MODERATE' | 'HIGH';
  genericHits: string[];
  blocks: string[];        // razones P0/P1
  decision: Decision;
}

// ---------- helpers ----------
const stripMd = (s: string) => (s || '').replace(/[#*_`>|\-\[\]()]/g, ' ');
const wordCount = (s: string) => stripMd(s).split(/\s+/).filter(Boolean).length;

const OFFICIAL_HOSTS = ['afip.gob.ar', 'arca.gob.ar', 'argentina.gob.ar', 'bcra.gob.ar',
  'anses.gob.ar', 'infoleg.gob.ar', 'boletinoficial.gob.ar', 'indec.gob.ar', 'arba.gov.ar',
  'agip.gob.ar', 'who.int', 'oms', 'msal.gob.ar', 'sedronar', 'inta.gob.ar', 'senasa.gob.ar',
  'gov', 'gob.', 'edu'];

const HIGH_HINTS = ['dosis', 'medicament', 'medicacion', 'insulina', 'paracetamol', 'ibuprofeno',
  'antibiot', 'anestesi', 'antiparasit', 'antipulga', 'desparasit', 'ivermectina', 'suplement',
  'creatina', 'cafeina-dosis', 'magnesio-dosis', 'vitamina-d-dosis', 'whey', 'alcoholemia',
  'exposicion-sol', 'spf-proteccion', 'protector-solar', 'fertilidad-clinica', 'embarazo-riesgo',
  'sintomas-diagnos', 'riesgo-enfermedad'];
const MODERATE_CATS = new Set(['salud', 'mascotas', 'deportes', 'familia', 'impuestos', 'finanzas', 'laboral']);

function ymylLevel(c: any): 'LOW' | 'MODERATE' | 'HIGH' {
  const slug = (c.slug || '').toLowerCase();
  if (c.ymylRisk === 'high' || HIGH_HINTS.some((h) => slug.includes(h))) return 'HIGH';
  if (c.ymylRisk === 'medium' || MODERATE_CATS.has(String(c.category))) return 'MODERATE';
  return 'LOW';
}

function editorialState(c: any): EditorialState {
  // Estado inicial derivado (el sistema editorial #1 lo persistirá luego).
  if (c.status === 'draft' || c.distribution === 'restricted') return 'draft';
  if (isRestrictedCalc(c)) return 'draft';                        // YMYL high sin revisor
  if (hasValidProfessionalReviewer(c)) return 'professionally_reviewed';
  return 'automated_tested'; // pasó validate:data pero sin revisión editorial individual persistida
}

function findGeneric(raw: string): string[] {
  const hits: string[] = [];
  for (const lit of GENERIC_LITERAL) if (raw.includes(lit)) hits.push(lit);
  for (const re of GENERIC_TOKEN) if (re.test(raw)) hits.push(re.source);
  return hits;
}

function formulaSignature(c: any): string {
  const inputs = (c.fields || []).map((f: any) => f.id).sort().join(',');
  return `${c.formulaId || '?'}|${inputs}|${c.category || '?'}`;
}

// ---------- carga ----------
const rows: Row[] = [];
const bySignature = new Map<string, Row[]>();
const descSeen = new Map<string, string[]>(); // meta description → slugs
const prunedSet = new Set(Object.keys(PRUNING_REDIRECTS).map((p) => p.replace(/^\//, '')));

for (const [folder, meta] of Object.entries(LOCALES)) {
  const dir = join(CONTENT, folder);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    let c: any;
    let raw: string;
    try { raw = readFileSync(join(dir, file), 'utf8'); c = JSON.parse(raw); } catch { continue; }
    if (!c || !c.slug) continue;

    const sources = Array.isArray(c.sources) ? c.sources : [];
    const officialSources = sources.filter((s: any) =>
      OFFICIAL_HOSTS.some((h) => String(s?.url || '').toLowerCase().includes(h))).length;
    const explanation = typeof c.explanation === 'string' ? c.explanation : '';
    const words = wordCount([c.intro, c.keyTakeaway, explanation,
      ...(c.faq || []).map((q: any) => (q.q || '') + ' ' + (q.a || ''))].join(' '));
    const generic = findGeneric(raw);
    const ymyl = ymylLevel(c);
    const state = editorialState(c);

    const row: Row = {
      url: `https://hacecuentas.com/${meta.prefix ? `${meta.prefix}/` : ''}${c.slug}`,
      slug: c.slug, lang: meta.lang, country: meta.country, category: c.category || '',
      editorialState: state,
      indexable: !isRestrictedCalc(c) && c.noindex !== true && !prunedSet.has(c.slug),
      canonical: `https://hacecuentas.com/${meta.prefix ? `${meta.prefix}/` : ''}${c.slug}`,
      title: c.title || '', metaDescription: c.description || '', h1: c.h1 || '',
      words, wordsBody: words,
      sources: sources.length, officialSources,
      reviewDate: c.lastReviewed || '', dataUpdate: c.dataUpdate?.lastUpdated || '',
      editor: c.editor || 'Martín Rodríguez',
      professionalReviewer: c.professionalReviewer?.name || '',
      fields: (c.fields || []).length,
      formulaSignature: formulaSignature(c),
      formulaType: c.methodType || c.formulaType || (c.formulaId ? 'programmed-method' : 'undocumented'),
      primarySource: sources[0]?.name || c.dataUpdate?.source || '',
      primarySourceUrl: sources[0]?.url || c.dataUpdate?.sourceUrl || '',
      sourceVerified: c.sourceVerified === true,
      automatedTests: c.automatedTests || 'pending',
      adsEligible: canAdvertiseCalc(c),
      quarantineReasons: Array.isArray(c.quarantineReasons) ? c.quarantineReasons : [],
      hasTests: c.automatedTests === 'passed',
      ymyl, genericHits: generic, blocks: [], decision: 'KEEP',
    };

    // ---- quality gate (#7) ----
    const B = row.blocks;
    // P0 (bloqueo duro)
    if (generic.length) B.push('P0:frase-generica:' + generic.join('|'));
    if (!row.title.trim() || /^(resultado|calculadora)$/i.test(row.title.trim())) B.push('P0:title-vacio-o-generico');
    if (!row.h1.trim()) B.push('P0:h1-vacio');
    if (row.reviewDate && row.reviewDate > TODAY) B.push('P0:fecha-futura');
    if (ymyl === 'HIGH' && !hasValidProfessionalReviewer(c)) B.push('P0:ymyl-high-sin-revisor');
    // P1 (mejorable, no publicable hasta arreglar)
    if (sources.length < 1) B.push('P1:sin-fuentes');
    if (explanation.length < 600) B.push('P1:explicacion-thin');
    if (!c.example && !c.solvedExample && !(Array.isArray(c.solvedExamples) && c.solvedExamples.length))
      B.push('P1:sin-ejemplo');

    // meta description duplicada (se resuelve tras cargar todo)
    if (row.metaDescription) {
      const arr = descSeen.get(row.metaDescription) || [];
      arr.push(row.slug + '@' + row.country); descSeen.set(row.metaDescription, arr);
    }

    rows.push(row);
    const sig = row.formulaSignature + '@' + row.country;
    const g = bySignature.get(sig) || []; g.push(row); bySignature.set(sig, g);
  }
}

// ---- meta description duplicada (P1) ----
for (const [desc, slugs] of descSeen) {
  if (slugs.length > 1 && desc.length > 20) {
    for (const s of slugs) {
      const [slug, country] = s.split('@');
      const r = rows.find((x) => x.slug === slug && x.country === country);
      if (r) r.blocks.push('P1:meta-desc-duplicada');
    }
  }
}

// ---- grupos duplicados (misma firma de fórmula + país) ----
const dupGroups: Row[][] = [];
for (const [, g] of bySignature) {
  const vivos = g.filter((r) => r.editorialState !== 'draft' && !prunedSet.has(r.slug));
  if (vivos.length > 1) dupGroups.push(vivos);
}
// marcar perdedores (los no-ganadores) como MERGE_301. Ganador = más palabras + fuentes.
for (const g of dupGroups) {
  const winner = [...g].sort((a, b) =>
    (b.words + b.sources * 200 + b.officialSources * 300) - (a.words + a.sources * 200 + a.officialSources * 300))[0];
  for (const r of g) if (r !== winner) r.blocks.push('P1:duplicado-de:' + winner.slug);
}

// ---- decisión final por URL ----
for (const r of rows) {
  // Podadas: ya responden 301 hacia su destino, no son URLs públicas.
  if (prunedSet.has(r.slug)) { r.decision = 'MERGE_301'; r.editorialState = 'draft'; r.indexable = false; continue; }
  const hasP0 = r.blocks.some((b) => b.startsWith('P0'));
  const isDup = r.blocks.some((b) => b.startsWith('P1:duplicado-de'));
  const hasP1 = r.blocks.some((b) => b.startsWith('P1') && !b.startsWith('P1:duplicado-de'));
  if (r.editorialState === 'draft' || hasP0) r.decision = 'DRAFT';
  else if (isDup) r.decision = 'MERGE_301';
  else if (hasP1) r.decision = 'IMPROVE';
  else r.decision = 'KEEP';
}

// ---------- reports ----------
if (!existsSync(REPORTS)) mkdirSync(REPORTS, { recursive: true });
const publishable = rows.filter((r) => r.decision === 'KEEP');
const csvEsc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;

writeFileSync(join(REPORTS, 'adsense-audit.json'), JSON.stringify({
  generatedFor: TODAY, total: rows.length,
  byDecision: rows.reduce((a, r) => ((a[r.decision] = (a[r.decision] || 0) + 1), a), {} as any),
  rows,
}, null, 2));

const cols: (keyof Row)[] = ['url', 'slug', 'lang', 'country', 'category', 'editorialState', 'indexable',
  'title', 'metaDescription', 'h1', 'words', 'sources', 'officialSources', 'reviewDate',
  'dataUpdate', 'editor', 'professionalReviewer', 'fields', 'formulaSignature', 'formulaType',
  'primarySource', 'primarySourceUrl', 'sourceVerified', 'automatedTests', 'adsEligible',
  'quarantineReasons', 'ymyl', 'blocks', 'decision'];
writeFileSync(join(REPORTS, 'adsense-audit.csv'),
  [cols.join(','), ...rows.map((r) => cols.map((c) => csvEsc(
    Array.isArray(r[c]) ? (r[c] as any[]).join(';') : r[c])).join(','))].join('\n'));

writeFileSync(join(REPORTS, 'adsense-duplicate-groups.csv'),
  ['signature,country,members,winner,losers',
    ...dupGroups.map((g) => {
      const winner = g.find((r) => !r.blocks.some((b) => b.startsWith('P1:duplicado-de')))?.slug || '?';
      const losers = g.filter((r) => r.slug !== winner).map((r) => r.slug).join(';');
      return [g[0].formulaSignature, g[0].country, g.length, winner, losers].map(csvEsc).join(',');
    })].join('\n'));

writeFileSync(join(REPORTS, 'adsense-sensitive-pages.csv'),
  ['slug,country,ymyl,professionalReviewer,editorialState,decision',
    ...rows.filter((r) => r.ymyl !== 'LOW').map((r) =>
      [r.slug, r.country, r.ymyl, r.professionalReviewer, r.editorialState, r.decision].map(csvEsc).join(','))].join('\n'));

// broken-links: en V1 sólo detecta relatedSlugs a destinos podados/inexistentes (estático).
// Los enlaces HTTP live se validan aparte (find-broken-links.py). Se deja el header + estáticos.
const allSlugs = new Set(rows.map((r) => r.slug));
const brokenRows: string[] = [];
for (const [folder] of Object.entries(LOCALES)) {
  const dir = join(CONTENT, folder);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    let c: any; try { c = JSON.parse(readFileSync(join(dir, file), 'utf8')); } catch { continue; }
    for (const rel of (c.relatedSlugs || [])) {
      if (!allSlugs.has(rel) || prunedSet.has(rel)) brokenRows.push([c.slug, rel, prunedSet.has(rel) ? 'podado' : 'inexistente'].map(csvEsc).join(','));
    }
  }
}
writeFileSync(join(REPORTS, 'adsense-broken-links.csv'), ['from,to,reason', ...brokenRows].join('\n'));

// ---------- resumen ----------
const byDec = rows.reduce((a, r) => ((a[r.decision] = (a[r.decision] || 0) + 1), a), {} as Record<string, number>);
const p0InPublishable = publishable.filter((r) => r.blocks.some((b) => b.startsWith('P0')));
console.log('=== AUDIT:ADSENSE ===');
console.log('Total URLs auditadas:', rows.length);
console.log('Por decisión:', JSON.stringify(byDec));
console.log('KEEP (published):', byDec.KEEP || 0, '| IMPROVE:', byDec.IMPROVE || 0,
  '| MERGE_301:', byDec.MERGE_301 || 0, '| DRAFT:', byDec.DRAFT || 0);
console.log('Grupos duplicados:', dupGroups.length, '| Sensibles (MODERATE+HIGH):',
  rows.filter((r) => r.ymyl !== 'LOW').length, '| HIGH sin revisor:',
  rows.filter((r) => r.ymyl === 'HIGH' && !r.professionalReviewer).length);
console.log('relatedSlugs rotos:', brokenRows.length);
console.log('Frases genéricas en KEEP:', publishable.filter((r) => r.genericHits.length).length);
console.log('Reports → reports/adsense-*.{json,csv}');

const GATE = process.argv.includes('--gate');
if (p0InPublishable.length > 0) {
  console.error(`\n❌ GATE FAIL: ${p0InPublishable.length} páginas KEEP con bloqueo P0.`);
  process.exit(1);
}
console.log(GATE ? '\n✅ GATE OK: 0 KEEP con bloqueo P0.' : '\n(usá --gate para CI)');
