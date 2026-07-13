/**
 * Astro Content Collections — schema definitions (v6+).
 *
 * Migrado desde scripts/validate-data-updates.ts (2026-05-20):
 *   - Antes: validator standalone en prebuild. Fallaba silencioso si alguien
 *     lo salteaba (caso 13/5: updateType="auto" perdio 5 commits).
 *   - Ahora: Astro corre Zod en cada build. Imposible saltearlo.
 *
 * Estrategia conservadora:
 *   - Strict en lo que ya causo bugs en prod (dataUpdate, audience).
 *   - .passthrough() en el resto para no romper las miles de calcs existentes
 *     que tienen campos heredados / experimentales.
 *
 * IMPORTANTE: actualmente [...slug].astro NO usa getCollection() — sigue
 * usando import.meta.glob() directo. Las collections aca solo activan la
 * validacion Zod en build time, sin cambiar el rendering pipeline.
 */
import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

// ---- Enums extraidos de scripts/validate-data-updates.ts ----

const updateFrequency = z.enum([
  'never',
  'daily',
  'weekly',
  'monthly',
  'quarterly',  // trimestral (calcs-cl, calcs-co)
  'biannual',
  'annual',     // sinonimo de yearly (calcs-cl, calcs-co)
  'yearly',
]);

const updateType = z.enum([
  'manual',
  'auto-api',
  'auto-scrape',
  'auto-llm',
]);

// Audiences detectadas en src/content/calcs*/*.json (incluye lowercase legacy)
const audience = z.enum([
  'AR', 'ar',
  'BR', 'br',
  'MX', 'ES', 'CO', 'CL', 'BO', 'PE', 'EC', 'US', 'EN', 'PT',
  'VE', 'PY', 'UY', 'DO',
  'global',
]);

const dateString = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  { message: 'Debe ser YYYY-MM-DD' },
);

// ---- YMYL / política de contenido (ver src/lib/content-policy.ts) ----
// Campos opcionales y backward-compatible: las miles de calcs existentes que
// no los declaran siguen validando. La restricción efectiva la deriva
// content-policy.ts (ymylRisk==='high' sin revisor => restringida), NO depende
// de que cada JSON ponga noindex:true a mano.

const ymylRiskEnum = z.enum(['low', 'medium', 'high']);
const reviewTypeEnum = z.enum(['editorial', 'professional']);
const distributionEnum = z.enum(['normal', 'restricted']);

// Revisor profesional REAL (médico/nutricionista/veterinario/kinesiólogo…),
// distinto del autor/editor Martín Rodríguez. Si el objeto existe, exige los
// campos obligatorios: un revisor incompleto hace fallar el build (spec Fase 2).
const professionalReviewer = z.object({
  name: z.string().min(1, 'professionalReviewer.name requerido'),
  profession: z.string().min(1, 'professionalReviewer.profession requerido'),
  credential: z.string().min(1, 'professionalReviewer.credential requerido'),
  licenseNumber: z.string().optional(),
  profileUrl: z.string().url('professionalReviewer.profileUrl debe ser una URL válida'),
  reviewedAt: dateString,
}).strict();

// ---- dataUpdate sub-schema (donde se rompian deploys silenciosos) ----

// dataUpdate base — sin reglas de source (acepta cualquier combinacion)
const dataUpdateBase = z.object({
  frequency: updateFrequency,
  lastUpdated: dateString,
  // dataAsOf = fecha a la que CORRESPONDE el dato real (ej. el mes del IPC, la
  // fecha de la UF, la vigencia de la ley), distinta de lastUpdated = cuándo
  // refrescamos/revisamos nuestra copia. Opcional y backward-compatible: si
  // falta, el display cae a lastUpdated. NO lo usa el sitemap (lastmod sigue
  // con lastUpdated) — es solo honestidad de cara al usuario / E-E-A-T.
  dataAsOf: dateString.optional(),
  updateType: updateType,
  source: z.string().nullable().optional(),
  sourceUrl: z.string().nullable().optional(),
  notes: z.string().optional(),
});

// dataUpdate strict — exige source+sourceUrl si frequency!=never.
// Solo se aplica a calcs/ (AR) que es la coleccion principal, replicando
// el comportamiento de scripts/validate-data-updates.ts. Los otros locales
// quedan permissive (audit gradual, no romper deploys de calcs-en/cl/co/etc.)
const dataUpdateStrict = dataUpdateBase.superRefine((val, ctx) => {
  if (val.frequency !== 'never') {
    if (!val.source) {
      ctx.addIssue({ code: 'custom', path: ['source'], message: `Required cuando frequency='${val.frequency}'` });
    }
    if (!val.sourceUrl) {
      ctx.addIssue({ code: 'custom', path: ['sourceUrl'], message: `Required cuando frequency='${val.frequency}'` });
    }
  }
});

// ---- Calc schema (passthrough en lo no critico) ----

// Schema base reusable. AR usa la version strict de dataUpdate; los otros
// locales la version base (sin require de source).
// AR es el master locale: dataUpdate es required + strict.
// Locales secundarios: dataUpdate optional (40 calcs-en historicas no lo tienen).
// Tablas de referencia estáticas (rangos IMC, pesos por altura, tramos de impuesto…).
// Render server-side en [...slug].astro → contenido SEO que el bot ve sin ejecutar JS.
const referenceTable = z.object({
  title: z.string(),
  caption: z.string().optional(),
  headers: z.array(z.string()).min(1),
  rows: z.array(z.array(z.union([z.string(), z.number()]))).min(1),
  note: z.string().optional(),
  /** Índice de columna (0-based) a resaltar visualmente. */
  highlightCol: z.number().int().optional(),
});

const makeCalcSchema = (strictDataUpdate: boolean) => z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  audience: audience.optional(),
  dataUpdate: strictDataUpdate ? dataUpdateStrict : dataUpdateBase.optional(),
  h1: z.string().optional(),
  icon: z.string().optional(),
  formulaId: z.string().optional(),
  lastReviewed: dateString.optional(),
  referenceTables: z.array(referenceTable).optional(),
  // ---- YMYL / política de contenido ----
  ymylRisk: ymylRiskEnum.optional(),          // default conceptual: 'low'
  reviewType: reviewTypeEnum.optional(),      // default conceptual: 'editorial'
  distribution: distributionEnum.optional(),  // 'restricted' fuerza restricción manual
  restrictedMode: z.enum(['dose', 'injury', 'baby', 'clinical']).optional(),  // subgrupo del aviso
  noindex: z.boolean().optional(),
  // ---- Estados editoriales (plan AdSense: 4 flags independientes) ----
  status: z.enum(['draft', 'reviewed']).optional(),  // 'draft' = incompleta/sin revisar → oculta (noindex + fuera de nav/sitemap)
  ymylReviewed: z.boolean().optional(),        // YMYL con revisión completa verificada
  adsenseEligible: z.boolean().optional(),     // false = sin anuncios pero SIGUE indexable (apuestas/juego)
  professionalReviewer: professionalReviewer.optional(),
}).passthrough().superRefine((val, ctx) => {
  // reviewType='professional' EXIGE un revisor profesional completo.
  if (val.reviewType === 'professional' && !val.professionalReviewer) {
    ctx.addIssue({
      code: 'custom',
      path: ['professionalReviewer'],
      message: "reviewType='professional' requiere professionalReviewer (name, profession, credential, profileUrl, reviewedAt)",
    });
  }
  // NOTA: una calc ymylRisk='high' SIN revisor profesional es válida y compila;
  // content-policy.ts la marca restringida (noindex) automáticamente. No se
  // valida aquí para no obligar a tocar cada JSON a mano.
});

// ---- Collection definitions (Astro v6 glob loader) ----

const makeCalcCollection = (dir: string, strict = false) => defineCollection({
  loader: glob({ pattern: '*.json', base: `./src/content/${dir}` }),
  schema: makeCalcSchema(strict),
});

export const collections = {
  'calcs': makeCalcCollection('calcs', true),  // strict: AR es el master locale
  'calcs-mx': makeCalcCollection('calcs-mx'),
  'calcs-es': makeCalcCollection('calcs-es'),
  'calcs-co': makeCalcCollection('calcs-co'),
  'calcs-cl': makeCalcCollection('calcs-cl'),
  'calcs-pe': makeCalcCollection('calcs-pe'),
  'calcs-ec': makeCalcCollection('calcs-ec'),
  'calcs-ve': makeCalcCollection('calcs-ve'),
  'calcs-py': makeCalcCollection('calcs-py'),
  'calcs-uy': makeCalcCollection('calcs-uy'),
  'calcs-do': makeCalcCollection('calcs-do'),
  'calcs-pt': makeCalcCollection('calcs-pt'),       // Brasil (pt-BR)
  'calcs-pt-pt': makeCalcCollection('calcs-pt-pt'), // Portugal (pt-PT)
  'calcs-en': makeCalcCollection('calcs-en'),
};
