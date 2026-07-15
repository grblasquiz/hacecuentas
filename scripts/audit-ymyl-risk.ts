/**
 * audit-ymyl-risk.ts — Auditoría automática de riesgo YMYL (Fase 4).
 *
 * Recorre TODAS las colecciones de calculadoras (src/content/calcs*), escanea
 * señales de riesgo alto (dosis, medicamentos, tratamiento, retorno deportivo,
 * alimentación de bebés, dosis veterinarias…) y produce:
 *
 *   - reports/ymyl-risk-audit.json
 *   - reports/ymyl-risk-audit.csv
 *
 * SOLO reporta. NO modifica ningún JSON (los cambios de la primera tanda se
 * aplican a mano en Fase 5). Es idempotente y sin dependencias externas.
 *
 * Correr:  node --experimental-strip-types scripts/audit-ymyl-risk.ts
 *          npm run audit:ymyl
 *
 * Flags:
 *   --all     incluir también las calcs sin señales (riesgo low) en el JSON.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  hasValidProfessionalReviewer,
  isIndexableCalc,
  isRestrictedCalc,
} from '../src/lib/content-policy.ts';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'src/content');
const FORMULAS_DIR = join(ROOT, 'src/lib/formulas');
const REPORTS_DIR = join(ROOT, 'reports');

// dir de colección → prefijo de URL (AR sin prefijo, el resto /locale).
const CALC_DIRS: Record<string, string> = {
  'calcs': '',
  'calcs-es': '/es', 'calcs-mx': '/mx', 'calcs-co': '/co', 'calcs-cl': '/cl',
  'calcs-pe': '/pe', 'calcs-ec': '/ec', 'calcs-ve': '/ve', 'calcs-py': '/py',
  'calcs-uy': '/uy', 'calcs-do': '/do', 'calcs-pt': '/pt', 'calcs-pt-pt': '/pt-pt',
  'calcs-en': '/en',
};

// ---- Léxico de riesgo (spec Fase 4). Normalizado sin acentos, en minúsculas. ----

// Términos que implican DOSIS o TRATAMIENTO prescriptivo (riesgo alto directo).
const DOSE_TERMS = [
  'dosis', 'dosificacion', 'mg/kg', 'ml/kg', 'comprimidos', 'gotas',
  'miligramos', 'insulina', 'paracetamol', 'ibuprofeno', 'antibiotico', 'antipulgas',
];
// Medicamentos / suplementos (riesgo alto).
const MED_TERMS = [
  'medicamento', 'medicacion', 'suplemento', 'magnesio', 'medicamento veterinario',
];
// Tratamiento / retorno deportivo / cirugía (riesgo alto).
const TREATMENT_TERMS = [
  'tratamiento', 'diagnostico', 'rehabilitacion', 'recuperacion quirurgica',
  'retorno a entrenamiento', 'retorno a competencia', 'retorno al deporte',
];
// Alimentación de bebés (riesgo alto).
const BABY_TERMS = [
  'alimentacion complementaria', 'alimentacion de bebe', 'leche de formula',
  'percentil pediatrico', 'papilla',
];
// Señales clínicas más suaves (riesgo medio si aparecen solas).
const CLINICAL_TERMS = [
  'sintomas', 'enfermedad', 'lesion', 'creatinina', 'filtrado glomerular',
];

const HIGH_RISK_TERMS = [...DOSE_TERMS, ...MED_TERMS, ...TREATMENT_TERMS, ...BABY_TERMS];
const ALL_TERMS = [...HIGH_RISK_TERMS, ...CLINICAL_TERMS];

// Términos INEQUÍVOCAMENTE médicos/veterinarios (nombres de fármacos + med/
// suplemento + comprimidos). Distinguen salud real de usos genéricos de "dosis"
// (dosis de levadura en cocina, dosificación de hormigón en construcción).
const DRUG_TERMS = ['insulina', 'paracetamol', 'ibuprofeno', 'antibiotico', 'antipulgas', 'comprimidos'];
const MEDICAL_SIGNAL_TERMS = [...MED_TERMS, ...DRUG_TERMS];

// Palabras que indican personalización por datos del cuerpo.
const PERSONAL_INPUT_HINTS = ['peso', 'kg', 'edad', 'altura', 'weight', 'age', 'height'];

// Categorías donde el riesgo YMYL clínico/veterinario/nutricional es plausible.
// Fuera de estas, un término suelto (p.ej. "diagnostico" como clave genérica de
// resultado en una fórmula previsional) es casi siempre falso positivo.
const HEALTH_CATEGORIES = new Set(['salud', 'mascotas', 'deportes', 'familia']);

// ---- Helpers ----

function norm(s: unknown): string {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // strip diacríticos
}

function textOf(calc: any, keys: string[]): string {
  const parts: string[] = [];
  for (const k of keys) {
    const v = calc[k];
    if (v == null) continue;
    if (typeof v === 'string' || typeof v === 'number') parts.push(String(v));
    else parts.push(JSON.stringify(v));
  }
  return parts.join(' \n ');
}

function readFormulaSource(formulaId: unknown): string {
  if (!formulaId || typeof formulaId !== 'string') return '';
  const p = join(FORMULAS_DIR, `${formulaId}.ts`);
  if (!existsSync(p)) return '';
  try {
    return readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

// Matching por límite de palabra (evita falsos positivos por substring, p.ej.
// "gotas" dentro de otra palabra). Los términos con '/' o espacio se matchean
// como frase, con límites alfanuméricos a los costados.
const termRegexCache = new Map<string, RegExp>();
function termRe(term: string): RegExp {
  let re = termRegexCache.get(term);
  if (!re) {
    const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    re = new RegExp(`(?<![a-z0-9])${esc}(?![a-z0-9])`, 'i');
    termRegexCache.set(term, re);
  }
  return re;
}
function findTerms(haystack: string, terms: string[]): string[] {
  const found: string[] = [];
  for (const t of terms) {
    if (termRe(t).test(haystack)) found.push(t);
  }
  return found;
}

function csvCell(v: string): string {
  if (/[",\n;]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
  return v;
}

interface AuditRow {
  collection: string;
  slug: string;
  url: string;
  category: string;
  suggestedRisk: 'low' | 'medium' | 'high';
  reasons: string[];
  matchedTerms: string[];
  personalizedRecommendation: boolean;
  returnsDoseOrTreatment: boolean;
  hasProfessionalReviewer: boolean;
  currentlyIndexable: boolean;
  currentlyRestricted: boolean;
  declaredYmylRisk: string;
  recommendedAction: string;
}

// ---- Auditoría de una calc ----

function auditCalc(calc: any, collection: string): AuditRow | null {
  // Zonas: PROMINENTE (slug/título/H1/outputs/fórmula) vs CUERPO (descr/intro/
  // faq/explanation/…). Un término de riesgo alto en zona prominente pesa mucho
  // más que una mención suelta en el cuerpo (que suele ser falso positivo:
  // "tratamiento de datos", "medicamento" en un beneficio previsional, etc.).
  const slugSpaced = norm(calc.slug).replace(/[-/]/g, ' ');
  const outputsText = norm(textOf(calc, ['outputs']));
  const formulaText = norm(readFormulaSource(calc.formulaId));
  const fieldsText = norm(textOf(calc, ['fields']));
  const prominentText = [
    slugSpaced,
    norm(textOf(calc, ['title', 'h1'])),
    outputsText,
    formulaText,
  ].join(' \n ');
  const bodyText = norm(
    textOf(calc, [
      'description', 'answerSnippet', 'intro', 'keyTakeaway', 'useCases',
      'fields', 'explanation', 'faq', 'solvedExamples', 'seoKeywords',
    ]),
  );
  const allText = prominentText + ' \n ' + bodyText;

  const matched = Array.from(new Set(findTerms(allText, ALL_TERMS)));
  if (matched.length === 0) return null; // sin señal → no se reporta (salvo --all)

  const matchedProminent = findTerms(prominentText, ALL_TERMS);
  const matchedProminentHigh = matchedProminent.filter((t) => HIGH_RISK_TERMS.includes(t));
  const matchedClinical = matched.filter((t) => CLINICAL_TERMS.includes(t));

  const doseTermsSharp = DOSE_TERMS.filter((t) => t !== 'ml/kg'); // ml/kg se trata aparte
  // Señal médica inequívoca (fármaco/suplemento/comprimidos) en cualquier zona.
  const medContext = findTerms(allText, MEDICAL_SIGNAL_TERMS).length > 0;
  // Señal médica PROMINENTE (fármaco/suplemento/bebé en slug/título/outputs).
  // NO incluye "dosis"/"dosificacion" genéricas (cocina/construcción).
  const strongProminent = findTerms(prominentText, [...MEDICAL_SIGNAL_TERMS, ...BABY_TERMS]).length > 0;

  // Contexto de salud: categoría sensible, o señal médica (prominente o en cuerpo).
  // Sin esto NO se eleva a riesgo alto — evita "dosis de levadura" (cocina),
  // "dosificación de hormigón" (construcción) o "diagnostico" como clave de
  // resultado en una fórmula previsional.
  const healthContext =
    HEALTH_CATEGORIES.has(String(calc.category)) || strongProminent || medContext;

  // ¿Devuelve dosis/tratamiento CLÍNICO? Términos de dosis/tratamiento en
  // OUTPUTS/FÓRMULA, sólo dentro de contexto de salud. ml/kg cuenta como dosis
  // sólo si además hay término de medicación (excluye fluidos deportivos).
  // Informacionales: calendarios/cronogramas de vacunas, clasificaciones,
  // tablas de referencia, BAC/alcohol. NO son herramientas prescriptivas de
  // dosis aunque mencionen "dosis"/"tratamiento".
  const slugTitle = norm(calc.slug) + ' ' + norm(calc.title) + ' ' + norm(calc.h1);
  const isInformational = /calendario|cronograma|schedule|clasific|classif|tabela-oms|tabla-oms|reference-values|valores-referencia|widmark|alcoholemia|bac-|indice-glucemico|glucemic|panal|esfinter|potty|riesgo-embarazo|pregnancy-risk/.test(slugTitle);
  // Porción de alimento/nutrición (comida de mascota, proteína por comida): es
  // cantidad nutricional, no dosis de fármaco/suplemento. Se excluye salvo que
  // haya término médico prominente (medicamento/fármaco en slug/título).
  const isFoodPortion = /alimento|comida|racion|feeding|proteina|protein/.test(slugTitle)
    && findTerms(slugTitle, [...MEDICAL_SIGNAL_TERMS]).length === 0;

  const outFormula = outputsText + ' \n ' + formulaText;
  const returnsDoseOrTreatment = healthContext && !isInformational && !isFoodPortion && (
    findTerms(outFormula, [...doseTermsSharp, ...TREATMENT_TERMS]).length > 0 ||
    (findTerms(outFormula, ['ml/kg']).length > 0 && medContext)
  );

  // ¿Personaliza por datos del cuerpo? inputs con peso/edad/altura + output que
  // recomienda o entrega dosis. Sólo en contexto de salud.
  const hasPersonalInputs = PERSONAL_INPUT_HINTS.some((h) => new RegExp(`(?<![a-z0-9])${h}(?![a-z0-9])`, 'i').test(fieldsText));
  const recommends = /recomend|deberias|forma recomendada|elegi la forma/.test(outputsText + ' ' + prominentText);
  const personalizedRecommendation = healthContext && hasPersonalInputs && (returnsDoseOrTreatment || recommends);

  const strongSignal = returnsDoseOrTreatment || personalizedRecommendation || strongProminent;

  // Riesgo sugerido: high sólo con contexto de salud Y (señal fuerte o término
  // alto prominente). Si sólo hay mención en el cuerpo, o está fuera de contexto
  // de salud → medium (probable falso positivo). Nunca low si hubo match.
  let suggestedRisk: 'low' | 'medium' | 'high' = 'low';
  if (healthContext && (strongSignal || matchedProminentHigh.length > 0)) suggestedRisk = 'high';
  else if (matched.length > 0) suggestedRisk = 'medium';

  const reasons: string[] = [];
  if (returnsDoseOrTreatment) reasons.push('Devuelve dosis o pauta de tratamiento en outputs/fórmula');
  if (personalizedRecommendation) reasons.push('Recomendación personalizada por datos del cuerpo (peso/edad/altura)');
  if (strongProminent) reasons.push(`Término de riesgo alto en slug/título/outputs: ${findTerms(prominentText, [...MED_TERMS, ...BABY_TERMS, ...doseTermsSharp]).join(', ')}`);
  if (matched.some((t) => DOSE_TERMS.includes(t))) reasons.push(`Dosis/medicación: ${matched.filter((t) => DOSE_TERMS.includes(t)).join(', ')}`);
  if (matched.some((t) => TREATMENT_TERMS.includes(t))) reasons.push(`Tratamiento/retorno deportivo: ${matched.filter((t) => TREATMENT_TERMS.includes(t)).join(', ')}`);
  if (matched.some((t) => BABY_TERMS.includes(t))) reasons.push(`Alimentación de bebés: ${matched.filter((t) => BABY_TERMS.includes(t)).join(', ')}`);
  if (matchedClinical.length) reasons.push(`Señales clínicas: ${matchedClinical.join(', ')}`);
  if (calc.category === 'mascotas' && matched.some((t) => DOSE_TERMS.includes(t) || MED_TERMS.includes(t))) {
    reasons.push('Dosis/medicación veterinaria (categoría mascotas)');
  }
  if (suggestedRisk === 'medium' && !healthContext) reasons.push(`Fuera de contexto de salud (categoría "${calc.category}") — probable falso positivo`);
  else if (suggestedRisk === 'medium' && !strongSignal) reasons.push('Sólo mención en el cuerpo (posible falso positivo)');

  const hasProfessionalReviewer = hasValidProfessionalReviewer(calc);
  const currentlyIndexable = isIndexableCalc(calc);
  const currentlyRestricted = isRestrictedCalc(calc);

  // Acción recomendada.
  let recommendedAction: string;
  if (currentlyRestricted || (suggestedRisk === 'high' && !currentlyIndexable)) {
    recommendedAction = 'OK — ya está noindex/restringida; verificar que el cálculo prescriptivo esté desactivado';
  } else if (suggestedRisk === 'high' && hasProfessionalReviewer) {
    recommendedAction = 'REVISIÓN HUMANA: declara revisor profesional; validar que la revisión sea real antes de indexar';
  } else if (suggestedRisk === 'high' && (returnsDoseOrTreatment || personalizedRecommendation)) {
    recommendedAction = 'RESTRINGIR: ymylRisk:high + distribution:restricted + noindex y desactivar cálculo prescriptivo (Fase 5A/B/C)';
  } else if (suggestedRisk === 'high') {
    recommendedAction = 'REVISIÓN HUMANA: concepto de riesgo alto prominente pero sin dosis prescriptiva; evaluar noindex';
  } else if (suggestedRisk === 'medium') {
    recommendedAction = 'REVISIÓN HUMANA: mención de término sensible en el cuerpo; probable falso positivo';
  } else {
    recommendedAction = 'Sin acción';
  }

  return {
    collection,
    slug: calc.slug,
    url: `${CALC_DIRS[collection] ?? ''}/${calc.slug}`,
    category: calc.category ?? '',
    suggestedRisk,
    reasons,
    matchedTerms: matched,
    personalizedRecommendation,
    returnsDoseOrTreatment,
    hasProfessionalReviewer,
    currentlyIndexable,
    currentlyRestricted,
    declaredYmylRisk: String(calc.ymylRisk ?? 'low'),
    recommendedAction,
  };
}

// ---- Main ----

function main() {
  const includeAll = process.argv.includes('--all');
  const rows: AuditRow[] = [];

  for (const collection of Object.keys(CALC_DIRS)) {
    const dir = join(CONTENT_DIR, collection);
    if (!existsSync(dir)) continue;
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    for (const f of files) {
      let calc: any;
      try {
        calc = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      } catch (e) {
        console.warn(`[ymyl-audit] skip JSON malformado ${collection}/${f}: ${(e as Error).message}`);
        continue;
      }
      const row = auditCalc(calc, collection);
      if (row) rows.push(row);
      else if (includeAll) {
        rows.push({
          collection, slug: calc.slug, url: `${CALC_DIRS[collection] ?? ''}/${calc.slug}`,
          category: calc.category ?? '', suggestedRisk: 'low', reasons: [], matchedTerms: [],
          personalizedRecommendation: false, returnsDoseOrTreatment: false,
          hasProfessionalReviewer: hasValidProfessionalReviewer(calc),
          currentlyIndexable: isIndexableCalc(calc), currentlyRestricted: isRestrictedCalc(calc),
          declaredYmylRisk: String(calc.ymylRisk ?? 'low'), recommendedAction: 'Sin acción',
        });
      }
    }
  }

  // Orden: high → medium → low; dentro, los indexables sin revisor primero.
  const riskRank = { high: 0, medium: 1, low: 2 } as const;
  rows.sort((a, b) => {
    if (riskRank[a.suggestedRisk] !== riskRank[b.suggestedRisk]) return riskRank[a.suggestedRisk] - riskRank[b.suggestedRisk];
    if (a.currentlyIndexable !== b.currentlyIndexable) return a.currentlyIndexable ? -1 : 1;
    return a.slug.localeCompare(b.slug);
  });

  const summary = {
    generatedBy: 'scripts/audit-ymyl-risk.ts',
    totalFlagged: rows.length,
    high: rows.filter((r) => r.suggestedRisk === 'high').length,
    medium: rows.filter((r) => r.suggestedRisk === 'medium').length,
    low: rows.filter((r) => r.suggestedRisk === 'low').length,
    highIndexableWithoutReviewer: rows.filter(
      (r) => r.suggestedRisk === 'high' && r.currentlyIndexable && !r.hasProfessionalReviewer,
    ).length,
    doseOrTreatmentIndexable: rows.filter(
      (r) => r.returnsDoseOrTreatment && r.currentlyIndexable,
    ).length,
  };

  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true });

  writeFileSync(
    join(REPORTS_DIR, 'ymyl-risk-audit.json'),
    JSON.stringify({ summary, rows }, null, 2),
    'utf8',
  );

  // CSV
  const header = [
    'collection', 'slug', 'url', 'category', 'suggestedRisk', 'declaredYmylRisk',
    'returnsDoseOrTreatment', 'personalizedRecommendation', 'hasProfessionalReviewer',
    'currentlyIndexable', 'currentlyRestricted', 'matchedTerms', 'reasons', 'recommendedAction',
  ];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push([
      r.collection, r.slug, r.url, r.category, r.suggestedRisk, r.declaredYmylRisk,
      String(r.returnsDoseOrTreatment), String(r.personalizedRecommendation),
      String(r.hasProfessionalReviewer), String(r.currentlyIndexable), String(r.currentlyRestricted),
      r.matchedTerms.join('; '), r.reasons.join('; '), r.recommendedAction,
    ].map((c) => csvCell(String(c))).join(','));
  }
  writeFileSync(join(REPORTS_DIR, 'ymyl-risk-audit.csv'), lines.join('\n') + '\n', 'utf8');

  console.log('[ymyl-audit] Reporte generado en reports/ymyl-risk-audit.{json,csv}');
  console.log(`[ymyl-audit] flagged=${summary.totalFlagged}  high=${summary.high}  medium=${summary.medium}` +
    `  high-indexable-sin-revisor=${summary.highIndexableWithoutReviewer}  dosis/tratamiento-indexable=${summary.doseOrTreatmentIndexable}`);

  // --check: modo gate para CI/pre-deploy. Falla (exit 1) si detecta violaciones.
  if (process.argv.includes('--check')) {
    const violations: string[] = [];

    // 1) Herramienta de dosis/tratamiento PERSONALIZADA (no informacional)
    //    indexable sin revisor profesional — el caso que la spec prohíbe.
    const doseIndexable = rows.filter(
      (r) => r.returnsDoseOrTreatment && r.personalizedRecommendation && r.currentlyIndexable && !r.hasProfessionalReviewer,
    );
    for (const r of doseIndexable) {
      violations.push(`dosis/tratamiento indexable sin revisor: ${r.collection}/${r.slug}`);
    }

    // 2) Slugs restringidos que se filtraron a sitemaps / search-index / page-feed.
    const restrictedSlugs = rows.filter((r) => r.currentlyRestricted).map((r) => r.slug);
    const channelFiles = [
      ...(existsSync(join(ROOT, 'public'))
        ? readdirSync(join(ROOT, 'public')).filter((f) => f.startsWith('sitemap') && f.endsWith('.xml')).map((f) => join(ROOT, 'public', f))
        : []),
      join(ROOT, 'public/search-index.json'),
      join(ROOT, 'public/google-page-feed.csv'),
      join(ROOT, 'src/lib/related-auto.json'),
    ].filter((f) => existsSync(f));
    const exactSlugInChannel = (txt: string, slug: string): boolean => {
      const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Exige límite de ruta/valor a ambos lados: evita que `foo` coincida con
      // `foo-bar`, que producía falsos positivos en slugs prefijo.
      return new RegExp(`(?:^|[\\/"'>,])${escaped}(?=$|[\\/"'<,?#])`, 'm').test(txt);
    };
    for (const f of channelFiles) {
      const txt = readFileSync(f, 'utf8');
      for (const slug of restrictedSlugs) {
        if (exactSlugInChannel(txt, slug)) {
          violations.push(`restringida en canal ${f.replace(ROOT + '/', '')}: ${slug}`);
        }
      }
    }

    // 3) Atribución de revisión clínica a Martín en plantillas de calc.
    const FORBIDDEN = ['Revisado por Martín Rodríguez', 'Revisión médica por Martín Rodríguez', 'Fórmula revisada por Martín Rodríguez'];
    for (const rel of ['dist/client/calculadora-magnesio-glicinato-vs-citrato-vs-malato-dosis.html']) {
      const p = join(ROOT, rel);
      if (!existsSync(p)) continue;
      const html = readFileSync(p, 'utf8');
      for (const phrase of FORBIDDEN) {
        if (html.includes(phrase)) violations.push(`atribución clínica a Martín en restringida: ${rel} → "${phrase}"`);
      }
    }

    if (violations.length) {
      console.error(`\n[ymyl-audit] ✗ CHECK FALLÓ con ${violations.length} violación(es):`);
      violations.slice(0, 40).forEach((v) => console.error('  - ' + v));
      process.exit(1);
    }
    console.log('[ymyl-audit] ✓ CHECK OK — sin dosis indexables sin revisor ni restringidas en canales.');
  }
}

main();
