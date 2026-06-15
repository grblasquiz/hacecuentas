export const meta = {
  name: 'build-country-calcs',
  description: 'Construye calcs fiscales/laborales nuevas para un país (PE/EC) con plan → build → verificación adversarial de data YMYL',
  phases: [
    { title: 'Plan', detail: 'Definir lista vetada de conceptos (gap vs CO/MX/CL, sin duplicar, aplicables al país)' },
    { title: 'Build', detail: 'Cada calc: formula .ts + JSON completo, research de data 2026' },
    { title: 'Verify', detail: 'Verificación adversarial de data 2026 vs fuente oficial + sanity de schema/fórmula' },
  ],
}

// args: { country, countryName, prefix, dataLib, currency, count, sourceOrgs }
const A = args || {}
const COUNTRY = A.country            // 'pe' | 'ec'
const CNAME = A.countryName          // 'Perú' | 'Ecuador'
const DIR = `src/content/calcs-${COUNTRY}`
const SUFFIX = A.suffix              // '-peru' | '-ecuador'
const DATALIB = A.dataLib            // 'peru-2026' | 'ecuador-2026'
const CURRENCY = A.currency          // 'S/' | 'US$'
const COUNT = A.count || 28
const SOURCES = A.sourceOrgs         // 'SUNAT, MTPE, EsSalud, IESS...'

const SPEC_SCHEMA = {
  type: 'object',
  properties: {
    calcs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          formulaId: { type: 'string', description: `kebab-case, DEBE terminar en "${SUFFIX}". El archivo será ${DATALIB ? '' : ''}<formulaId>.ts y <formulaId>.json` },
          slug: { type: 'string', description: 'calculadora-<formulaId>' },
          h1: { type: 'string' },
          title: { type: 'string', description: 'title SEO con año 2026' },
          category: { type: 'string', enum: ['finanzas','impuestos','vida','familia','automotor','educacion','negocios','salud','viajes'] },
          icon: { type: 'string', description: 'un emoji' },
          scope: { type: 'string', description: 'qué calcula, inputs y outputs en 1-2 frases, y el dato/norma local clave 2026' },
        },
        required: ['formulaId','slug','h1','title','category','icon','scope'],
      },
    },
  },
  required: ['calcs'],
}

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    formulaId: { type: 'string' },
    slug: { type: 'string' },
    builtOk: { type: 'boolean', description: 'true solo si el formula .ts compila con tsx Y el JSON parsea Y pasa el schema' },
    tsxOk: { type: 'boolean' },
    jsonOk: { type: 'boolean' },
    dataClaims: { type: 'array', items: { type: 'string' }, description: 'cada dato/valor/tasa 2026 afirmado, con su fuente, para que el verificador los chequee' },
    notes: { type: 'string' },
  },
  required: ['formulaId','slug','builtOk','dataClaims'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    verdict: { type: 'string', enum: ['ok','fixed','broken'], description: 'ok=correcto; fixed=encontré errores y los corregí en los archivos; broken=roto y no se pudo arreglar' },
    dataAccurate: { type: 'boolean' },
    issuesFound: { type: 'array', items: { type: 'string' } },
    fixesApplied: { type: 'array', items: { type: 'string' } },
  },
  required: ['slug','verdict','dataAccurate','issuesFound'],
}

phase('Plan')
log(`Planificando ~${COUNT} calcs nuevas para ${CNAME} (${COUNTRY})`)

const planPrompt = `Sos un analista SEO + fiscal de ${CNAME}. Tarea: proponer ${COUNT} calculadoras NUEVAS de alto valor para ${CNAME} en hacecuentas.com.

CONTEXTO DEL REPO (leelo con tus tools):
- Catálogo PROBADO que ya tracciona: leé los nombres de archivo en src/content/calcs-co/, src/content/calcs-mx/ y src/content/calcs-cl/ (Colombia/México/Chile tienen ~100-120 calcs cada uno y rankean). Esos conceptos son demanda validada.
- Lo que YA EXISTE para ${CNAME} (NO duplicar): leé src/content/calcs-${COUNTRY}/ (hoy ~20, sólo finanzas e impuestos).
- Data canónica del país: leé src/lib/data/${DATALIB}.ts.

OBJETIVO: cubrir el GAP. ${CNAME} hoy NO tiene NADA en estas categorías: **vida** (recibo de luz/agua, costo de vida, alquiler asequible, canasta), **familia** (pensión de alimentos, licencia maternidad/paternidad), **automotor** (SOAT/seguro vehicular, impuesto al vehículo, revisión técnica), **educacion**, **negocios**, y le falta PROFUNDIDAD en **impuestos** (predial, alcabala/transferencia, ITF, renta 2da/ganancia de capital, regímenes RER/RMT/RIMPE) y **finanzas** (crédito hipotecario, crédito vehicular, préstamo personal, tarjeta de crédito, plazo fijo/depósito, jubilación AFP/IESS proyectada).

REGLAS DURAS:
1. Cada formulaId DEBE terminar en "${SUFFIX}" (garantiza unicidad de archivo de fórmula). slug = "calculadora-<formulaId>".
2. NO proponer nada que ya exista en src/content/calcs-${COUNTRY}/ ni que sea un conversor genérico sin data local (IMC, regla de tres, etc. ya existen globales).
3. Cada calc DEBE tener un dato/norma/tasa LOCAL 2026 real de ${CNAME} (si no tiene anclaje local, descartala — sería redundante con la global).
4. Verificá (con WebSearch si hace falta) que el concepto APLICA a ${CNAME} (ej: SOAT existe en Perú; en Ecuador es SPPAT/matriculación). No inventes instituciones ni impuestos.
5. Priorizá por intención de búsqueda real (cosas que la gente googlea: "cuánto es la pensión de alimentos", "impuesto predial", "cuota crédito hipotecario", "recibo de luz", "SOAT precio").

Devolvé exactamente ${COUNT} calcs en el schema. category de la lista permitida. icon = 1 emoji relevante. scope = 1-2 frases con inputs, outputs y el dato 2026 clave.`

const plan = await agent(planPrompt, { label: `plan:${COUNTRY}`, phase: 'Plan', schema: SPEC_SCHEMA, agentType: 'general-purpose' })
const specs = (plan?.calcs || []).filter(c => c && c.formulaId && c.formulaId.endsWith(SUFFIX))
log(`Plan: ${specs.length} calcs vetadas para ${CNAME}`)
if (!specs.length) return { error: 'plan vacío', country: COUNTRY }

const refNote = `REFERENCIAS DE ORO (leelas con Read ANTES de escribir):
- JSON gold-standard: src/content/calcs-pe/sueldo-neto-peru.json (TODOS los campos del schema, calidad esperada).
- Fórmula gold-standard: src/lib/formulas/essalud-aporte-peru.ts (patrón compute() + _insight + _chart).
- Data canónica: src/lib/data/${DATALIB}.ts (importá de acá lo que exista; importá con la ruta '../data/${DATALIB}.ts').
- Schema/validación: src/content.config.ts (campos requeridos; audience enum tiene "${COUNTRY.toUpperCase()}").`

const built = await pipeline(
  specs,
  // STAGE 1 — build
  (spec) => agent(
`Construí UNA calculadora completa para ${CNAME} en el repo hacecuentas (Astro). NO es un mensaje para humanos: tu salida es el structured output, pero el TRABAJO es escribir 2 archivos en el repo.

CALC ASIGNADA:
- formulaId: ${spec.formulaId}
- slug: ${spec.slug}
- h1: ${spec.h1}
- category: ${spec.category}  ·  icon: ${spec.icon}
- scope: ${spec.scope}

${refNote}

PASOS OBLIGATORIOS:
1. Leé las 4 referencias de arriba (Read). Entendé el patrón EXACTO.
2. Investigá la data 2026 REAL de ${CNAME} para esta calc (WebSearch/WebFetch a fuentes oficiales: ${SOURCES}). Anotá cada valor con su fuente.
3. Escribí la FÓRMULA en src/lib/formulas/${spec.formulaId}.ts:
   - export interface Inputs / Outputs; export function compute(i: Inputs): Outputs.
   - Importá constantes de '../data/${DATALIB}.ts' cuando existan; si un dato NO está en la lib, hardcodealo en el .ts con un comentario "// fuente: <org>, <url>, 2026".
   - Validá inputs (throw new Error con mensaje claro si faltan/0).
   - Devolvé outputs formateados (moneda ${CURRENCY}) + un _insight {title,text con **negritas**,tone,icon} + un _chart (doughnut/bar) como en el gold-standard.
   - Montos en moneda local. Math CORRECTA y trazable (NADA de v1*v2 placeholder).
4. Escribí el JSON en src/content/calcs-${COUNTRY}/${spec.formulaId}.json con TODOS los campos del gold-standard:
   slug, esSlug (omitir si no hay equivalente AR claro), title (con 2026), h1, description, category, audience:"${COUNTRY.toUpperCase()}", icon, formulaId:"${spec.formulaId}", answerSnippet (con cifras), intro (2-3 párrafos markdown), keyTakeaway, useCases (8-10), fields (coinciden con Inputs), outputs (coinciden con Outputs, uno primary:true), example {title,steps[],result}, explanation (markdown largo con tablas y links internos a /${COUNTRY}/<slug> que EXISTAN), faq (MÍNIMO 8, con cifras), sources (2-4, URLs REALES y verificadas), relatedSlugs: [], dataUpdate {frequency,lastUpdated:"2026-06-15",updateType:"manual",notes,source,sourceUrl}, seoKeywords (6-8), lastReviewed:"2026-06-15".
5. VALIDÁ antes de terminar:
   - Compilá la fórmula: \`npx tsx -e "import('./src/lib/formulas/${spec.formulaId}.ts').then(m=>console.log(typeof m.compute))"\` debe imprimir "function".
   - Parseá el JSON: \`node -e "JSON.parse(require('fs').readFileSync('src/content/calcs-${COUNTRY}/${spec.formulaId}.json'))"\` sin error.
   - Corré la fórmula con un caso ejemplo y confirmá que NO da NaN/undefined/Infinity.

Reglas YMYL: data 2026 EXACTA, fuentes oficiales reales (sin inventar URLs ni normas). FAQ ≥8 (regla del sitio). Si un valor no lo podés verificar, usá el más reciente oficial y aclaralo en dataUpdate.notes.

Devolvé el structured output. dataClaims = lista de cada cifra/tasa 2026 que usaste + su fuente (para auditoría).`,
    { label: `build:${spec.formulaId}`, phase: 'Build', schema: BUILD_SCHEMA, agentType: 'general-purpose' }
  ),
  // STAGE 2 — adversarial verify
  (b, spec) => {
    if (!b) return { slug: spec.slug, verdict: 'broken', dataAccurate: false, issuesFound: ['build agent murió/null'] }
    return agent(
`Auditor adversarial YMYL. Revisá la calc recién construida para ${CNAME} y CORREGÍ lo que esté mal directamente en los archivos.

ARCHIVOS:
- src/lib/formulas/${b.formulaId}.ts
- src/content/calcs-${COUNTRY}/${b.formulaId}.json

DATA CLAIMS que afirmó el builder (verificá CADA UNO contra fuente oficial 2026 con WebSearch/WebFetch):
${(b.dataClaims||[]).map(d => '- ' + d).join('\n') || '- (no reportó claims — auditá igual cada cifra del JSON/fórmula)'}

CHEQUEÁ:
1. DATA 2026: cada tasa/monto/tope/norma es la VIGENTE 2026 de ${CNAME} (${SOURCES}). Buscá normas derogadas/desactualizadas. Si un valor está mal → corregilo en el .ts Y en el JSON (answerSnippet, example, explanation, faq, dataUpdate).
2. FÓRMULA: la math es correcta y trazable (no placeholders v1*v2). Compilá con tsx y corré un caso: sin NaN/undefined/Infinity. fields del JSON coinciden con Inputs; outputs coinciden.
3. SCHEMA: FAQ ≥8, useCases 8-10, sources con URLs reales que resuelven, audience "${COUNTRY.toUpperCase()}", dataUpdate completo, lastReviewed 2026-06-15. links internos en explanation apuntan a slugs que existen en src/content/calcs-${COUNTRY}/.
4. JSON parsea.

Si encontrás errores, ARREGLALOS en los archivos (Edit/Write) y poné verdict:"fixed". Si está todo bien, verdict:"ok". Si está roto sin arreglo posible, verdict:"broken". Sé escéptico: ante la duda, verificá en la fuente, no asumas que el builder acertó.`,
      { label: `verify:${b.formulaId}`, phase: 'Verify', schema: VERIFY_SCHEMA, agentType: 'general-purpose' }
    )
  }
)

const results = built.filter(Boolean)
const ok = results.filter(r => r.verdict === 'ok' || r.verdict === 'fixed')
const broken = results.filter(r => r.verdict === 'broken')
log(`${CNAME}: ${ok.length} OK/fixed · ${broken.length} broken (de ${specs.length} planeadas)`)

return {
  country: COUNTRY,
  planned: specs.length,
  okCount: ok.length,
  brokenCount: broken.length,
  okSlugs: ok.map(r => r.slug),
  brokenSlugs: broken.map(r => r.slug),
  verifyDetail: results.map(r => ({ slug: r.slug, verdict: r.verdict, dataAccurate: r.dataAccurate, issues: r.issuesFound })),
}
