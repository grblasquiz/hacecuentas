export const meta = {
  name: 'build-ec-calcs',
  description: 'Construye ~28 calcs nuevas para Ecuador (categorías vacías + profundidad fiscal) con plan → build + verificación adversarial YMYL',
  phases: [
    { title: 'Plan', detail: 'Lista vetada de conceptos EC (gap vs CO/MX/CL, sin duplicar, aplicables a Ecuador dolarizado)' },
    { title: 'Build', detail: 'Cada calc: formula .ts + JSON completo, research data 2026' },
    { title: 'Verify', detail: 'Verificación adversarial de data 2026 vs fuente oficial + sanity fórmula/schema' },
  ],
}

const COUNTRY = 'ec'
const CNAME = 'Ecuador'
const AUD = 'EC'
const DATALIB = 'ecuador-2026'
const CURRENCY = 'US$'
const SUFFIX = '-ecuador'
const COUNT = 28
const SOURCES = 'SRI, IESS, Ministerio del Trabajo (MDT), BIESS, ANT, ARCERNNR/CNEL, INEC, Superintendencia de Bancos, municipios (GAD)'

const SPEC_SCHEMA = {
  type: 'object',
  properties: {
    calcs: { type: 'array', items: { type: 'object', properties: {
      formulaId: { type: 'string', description: `kebab-case, DEBE terminar en "${SUFFIX}"` },
      slug: { type: 'string', description: 'calculadora-<formulaId>' },
      h1: { type: 'string' }, title: { type: 'string', description: 'title SEO con 2026' },
      category: { type: 'string', enum: ['finanzas','impuestos','vida','familia','automotor','educacion','negocios','salud','viajes'] },
      icon: { type: 'string', description: 'un emoji' },
      scope: { type: 'string', description: 'qué calcula, inputs y outputs, y el dato/norma local 2026 clave' },
    }, required: ['formulaId','slug','h1','title','category','icon','scope'] } },
  }, required: ['calcs'],
}
const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    formulaId: { type: 'string' }, slug: { type: 'string' },
    builtOk: { type: 'boolean' },
    dataClaims: { type: 'array', items: { type: 'string' } }, notes: { type: 'string' },
  }, required: ['formulaId','slug','builtOk','dataClaims'],
}
const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    slug: { type: 'string' }, verdict: { type: 'string', enum: ['ok','fixed','broken'] },
    dataAccurate: { type: 'boolean' }, issuesFound: { type: 'array', items: { type: 'string' } },
    fixesApplied: { type: 'array', items: { type: 'string' } },
  }, required: ['slug','verdict','dataAccurate','issuesFound'],
}

phase('Plan')
log(`Planificando ~${COUNT} calcs nuevas para ${CNAME}`)
const plan = await agent(
`Sos analista SEO + fiscal de ${CNAME}. Proponé ${COUNT} calculadoras NUEVAS de alto valor para ${CNAME} (país DOLARIZADO, moneda US$) en hacecuentas.com.

CONTEXTO DEL REPO (leelo con tus tools):
- Catálogo PROBADO que ya rankea: nombres de archivo en src/content/calcs-co/, src/content/calcs-mx/, src/content/calcs-cl/ (~100-120 calcs c/u = demanda validada).
- Lo que YA EXISTE para ${CNAME} (NO duplicar): src/content/calcs-${COUNTRY}/ (hoy ~20, solo finanzas/impuestos: sueldo neto, décimos, IESS, fondos reserva, utilidades, IR, IVA, RIMPE, finiquito, jubilación IESS, préstamo quirografario, retención fuente, etc.).
- Data canónica: src/lib/data/${DATALIB}.ts.

OBJETIVO: cubrir el GAP. ${CNAME} hoy NO tiene NADA en: **vida** (planilla de luz CNEL, agua, costo de vida, canasta básica INEC, arriendo asequible), **familia** (pensión de alimentos tabla MIES, licencia maternidad/paternidad IESS), **automotor** (matriculación vehicular ANT, SPPAT, impuesto a los vehículos SRI/rodaje, revisión técnica, crédito vehicular), **educacion**, **negocios** (constitución de compañía Supercías, patente municipal, 1.5x1000 activos), y le falta PROFUNDIDAD en **impuestos** (predial municipal, alcabala, plusvalía, impuesto a la salida de divisas ISD, herencias) y **finanzas** (crédito hipotecario BIESS/bancos, préstamo quirografario ya existe, tarjeta de crédito, depósito a plazo fijo, cesantía IESS).

REGLAS DURAS:
1. Cada formulaId DEBE terminar en "${SUFFIX}". slug = "calculadora-<formulaId>".
2. NO dupliques nada de src/content/calcs-${COUNTRY}/ ni conversores genéricos globales (IMC, regla de 3...).
3. Cada calc DEBE tener un dato/norma/tasa LOCAL 2026 real de ${CNAME}. Si no tiene anclaje local, descartala.
4. Verificá (WebSearch) que el concepto APLICA a ${CNAME}: ojo, en Ecuador NO hay SOAT (es SPPAT), el crédito hipotecario estrella es BIESS, los impuestos municipales son predial/alcabala/patente/1.5x1000, hay ISD (5% salida de divisas). NO inventes instituciones ni impuestos.
5. Priorizá por intención de búsqueda real ("matriculación vehicular", "pensión alimenticia tabla", "impuesto predial", "cuota crédito BIESS", "planilla de luz").
6. Recordá: Ecuador es DOLARIZADO → montos en US$, NADA de conversión de moneda.

Devolvé exactamente ${COUNT} calcs en el schema. category de la lista. icon = 1 emoji. scope = 1-2 frases con inputs, outputs y el dato 2026 clave.`,
  { label: `plan:${COUNTRY}`, phase: 'Plan', schema: SPEC_SCHEMA, agentType: 'general-purpose' }
)
const SPECS = (plan?.calcs || []).filter(c => c && c.formulaId && c.formulaId.endsWith(SUFFIX)).map(c => ({ ...c, slug: c.slug && c.slug.startsWith('calculadora-') ? c.slug : 'calculadora-' + c.formulaId }))
log(`Plan: ${SPECS.length} calcs vetadas para ${CNAME}`)
if (!SPECS.length) return { error: 'plan vacío', country: COUNTRY }

const refNote = `REFERENCIAS DE ORO (Read ANTES de escribir):
- JSON gold-standard: src/content/calcs-ec/sueldo-neto-ecuador.json (todos los campos + calidad).
- Fórmula gold-standard: src/lib/formulas/aporte-iess-ecuador.ts (patrón compute() + _insight + _chart). Si no existe, usá src/lib/formulas/essalud-aporte-peru.ts.
- Data canónica: src/lib/data/${DATALIB}.ts (importá de '../data/${DATALIB}.ts' lo que exista: SBU, IESS, IR, etc.).
- Schema: src/content.config.ts (audience enum tiene "${AUD}").`

const built = await pipeline(
  SPECS,
  (spec) => agent(
`Construí UNA calculadora completa para ${CNAME} (DOLARIZADO, US$) en el repo hacecuentas (Astro). Tu salida es el structured output, pero el TRABAJO es escribir 2 archivos REALES.

CALC ASIGNADA:
- formulaId: ${spec.formulaId}  ·  slug: ${spec.slug}
- h1: ${spec.h1}  ·  title: ${spec.title}
- category: ${spec.category}  ·  icon: ${spec.icon}
- scope: ${spec.scope}

${refNote}

PASOS:
1. Leé las 4 referencias (Read). Copiá el patrón EXACTO.
2. Investigá la data 2026 REAL de ${CNAME} (WebSearch/WebFetch a oficiales: ${SOURCES}). Anotá cada valor con su fuente.
3. FÓRMULA en src/lib/formulas/${spec.formulaId}.ts: export interface Inputs/Outputs; export function compute(i: Inputs): Outputs. Importá de '../data/${DATALIB}.ts' lo que exista; si no, hardcodeá con "// fuente: <org>, <url>, 2026". Validá inputs (throw si faltan/0). Montos en US$ (Ecuador dolarizado, sin conversión). Devolvé outputs + _insight + _chart como el gold-standard. Math correcta, SIN placeholders.
4. JSON en src/content/calcs-ec/${spec.formulaId}.json con TODOS los campos del gold-standard: slug:"${spec.slug}", title:"${spec.title}", h1:"${spec.h1}", description, category:"${spec.category}", audience:"${AUD}", icon:"${spec.icon}", formulaId:"${spec.formulaId}", answerSnippet (cifras 2026), intro (2-3 párrafos md), keyTakeaway, useCases (8-10), fields (↔Inputs), outputs (↔Outputs, uno primary:true), example {title,steps[],result}, explanation (md largo con tablas y links internos a /ec/<slug-existente>), faq (MÍNIMO 8 con cifras), sources (2-4 URLs REALES verificadas), relatedSlugs:[], dataUpdate {frequency,lastUpdated:"2026-06-15",updateType:"manual",notes,source,sourceUrl}, seoKeywords (6-8), lastReviewed:"2026-06-15".
5. VALIDÁ: \`npx tsx -e "import('./src/lib/formulas/${spec.formulaId}.ts').then(m=>{console.log(JSON.stringify(m.compute(<caso válido>)))})"\` sin error ni NaN/undefined/Infinity; y \`node -e "JSON.parse(require('fs').readFileSync('src/content/calcs-ec/${spec.formulaId}.json','utf8'))"\`.

YMYL: data 2026 EXACTA, fuentes oficiales reales (no inventes URLs ni normas). FAQ ≥8. Devolvé dataClaims = cada cifra/tasa 2026 + fuente.`,
    { label: `build:${spec.formulaId}`, phase: 'Build', schema: BUILD_SCHEMA, agentType: 'general-purpose' }
  ),
  (b, spec) => {
    const fid = (b && b.formulaId) || spec.formulaId
    if (!b) return { slug: spec.slug, verdict: 'broken', dataAccurate: false, issuesFound: ['build null'] }
    return agent(
`Auditor adversarial YMYL para ${CNAME} (dolarizado). Revisá y CORREGÍ directamente en los archivos.

ARCHIVOS: src/lib/formulas/${fid}.ts · src/content/calcs-ec/${fid}.json

DATA CLAIMS del builder (verificá CADA UNO vs fuente oficial 2026 — ${SOURCES}):
${(b.dataClaims||[]).map(d => '- ' + d).join('\n') || '- (auditá cada cifra del JSON/fórmula)'}

CHEQUEÁ Y ARREGLÁ:
1. DATA 2026 de ${CNAME}: cada tasa/monto/tope/norma vigente 2026. Buscá normas derogadas. Mal → corregí en .ts Y JSON.
2. FÓRMULA: math correcta, sin placeholders. Compilá tsx + corré caso: sin NaN/undefined/Infinity. fields↔Inputs, outputs↔Outputs. Montos US$.
3. SCHEMA: FAQ ≥8, useCases 8-10, sources con URLs reales, audience "${AUD}", dataUpdate completo, lastReviewed 2026-06-15, links internos a slugs que EXISTAN en src/content/calcs-ec/.
4. JSON parsea.

Errores → arreglá (Edit/Write) y verdict:"fixed". Bien → "ok". Roto → "broken". Escéptico: ante duda, verificá en la fuente.`,
      { label: `verify:${fid}`, phase: 'Verify', schema: VERIFY_SCHEMA, agentType: 'general-purpose' }
    )
  }
)

const results = built.filter(Boolean)
const ok = results.filter(r => r.verdict === 'ok' || r.verdict === 'fixed')
const broken = results.filter(r => r.verdict === 'broken')
log(`${CNAME}: ${ok.length} OK/fixed · ${broken.length} broken (de ${SPECS.length})`)
return {
  country: COUNTRY, planned: SPECS.length, okCount: ok.length, brokenCount: broken.length,
  okSlugs: ok.map(r => r.slug), brokenSlugs: broken.map(r => r.slug),
  detail: results.map(r => ({ slug: r.slug, verdict: r.verdict, dataAccurate: r.dataAccurate, issues: (r.issuesFound||[]).slice(0,4) })),
}
