export const meta = {
  name: 'build-pe-calcs',
  description: 'Construye ~29 calcs nuevas para Perú (categorías vacías + profundidad fiscal) con build + verificación adversarial YMYL',
  phases: [
    { title: 'Build', detail: 'Cada calc: formula .ts + JSON completo, research data 2026' },
    { title: 'Verify', detail: 'Verificación adversarial de data 2026 vs fuente oficial + sanity fórmula/schema' },
  ],
}

const COUNTRY = 'pe'
const CNAME = 'Perú'
const AUD = 'PE'
const DATALIB = 'peru-2026'
const CURRENCY = 'S/'
const SOURCES = 'SUNAT, MTPE, EsSalud, SBS, BCRP, Osinergmin, Sunass, Sunarp, MTC, municipalidades, Midis'

// Specs vetados (del plan agent, limpiados). Cada formulaId termina en -peru → archivo único.
const SPECS = [{"formulaId":"recibo-luz-peru-osinergmin","slug":"calculadora-recibo-luz-peru-osinergmin","h1":"Calculadora de recibo de luz en Perú (Osinergmin)","title":"Calculadora de Recibo de Luz Perú 2026: Estima tu Consumo kWh","category":"vida","icon":"💡","scope":"Estima el recibo de luz mensual a partir del consumo en kWh y el cargo fijo por distribuidora (Luz del Sur, Enel, Hidrandina). Dato 2026: tarifas reguladas por Osinergmin con reducción promedio de 2,96% para hogares desde el 4-feb-2026."},{"formulaId":"recibo-agua-sedapal-peru","slug":"calculadora-recibo-agua-sedapal-peru","h1":"Calculadora de recibo de agua Sedapal (Perú)","title":"Calculadora Recibo de Agua Sedapal Perú 2026: Tarifa por m³","category":"vida","icon":"🚰","scope":"Calcula el recibo de agua y alcantarillado según consumo en m³ y categoría (social/doméstico/comercial). Dato 2026: tarifa media Sedapal sube a S/ 5 por m³ (Sunass), con alza gradual reflejada desde junio 2026."},{"formulaId":"costo-vida-mensual-peru","slug":"calculadora-costo-vida-mensual-peru","h1":"Calculadora de costo de vida mensual en Perú","title":"Calculadora Costo de Vida Perú 2026: Soltero, Pareja y Familia","category":"vida","icon":"🏠","scope":"Suma vivienda, alimentación, transporte y servicios para estimar el gasto mensual de un hogar en Lima/provincias. Dato 2026: RMV de referencia S/ 1.130 y costos de servicios actualizados (luz Osinergmin, agua Sedapal S/ 5/m³)."},{"formulaId":"canasta-basica-peru-inei","slug":"calculadora-canasta-basica-peru-inei","h1":"Calculadora de canasta básica familiar (Perú, INEI)","title":"Calculadora Canasta Básica Perú 2026: Línea de Pobreza INEI","category":"vida","icon":"🛒","scope":"Compara el ingreso del hogar contra la canasta básica de consumo por número de integrantes para ver si supera la línea de pobreza. Dato 2026: valores per cápita del INEI (línea de pobreza ~S/ 446/mes por persona) actualizados."},{"formulaId":"alquiler-asequible-ingreso-peru","slug":"calculadora-alquiler-asequible-ingreso-peru","h1":"Calculadora de alquiler asequible según ingreso (Perú)","title":"Calculadora Alquiler Asequible Perú 2026: Cuánto Pagar de Renta","category":"vida","icon":"🔑","scope":"Calcula el alquiler máximo recomendable (regla 30% del ingreso neto) y compara con precios promedio por distrito de Lima. Dato 2026: rangos de alquiler por distrito y RMV S/ 1.130 como piso de ingreso peruano."},{"formulaId":"pension-65-peru","slug":"calculadora-pension-65-peru","h1":"Calculadora de Pensión 65 (Perú)","title":"Calculadora Pensión 65 Perú 2026: Monto Bimestral y Requisitos","category":"vida","icon":"👴","scope":"Verifica elegibilidad (65+ años, clasificación SISFOH de pobreza extrema) y proyecta el cobro anual del subsidio. Dato 2026: Pensión 65 entrega S/ 350 bimestrales (Midis), seis pagos al año = S/ 2.100."},{"formulaId":"pension-alimentos-peru","slug":"calculadora-pension-alimentos-peru","h1":"Calculadora de pensión de alimentos en Perú","title":"Calculadora Pensión de Alimentos Perú 2026: Monto por Hijo","category":"familia","icon":"⚖️","scope":"Estima el monto mensual de pensión alimenticia según el ingreso del obligado y número de hijos, con el tope de embargo legal. Dato 2026: práctica judicial peruana 25-30% por 1 hijo hasta 60% por varios; embargo máximo 60% del ingreso."},{"formulaId":"licencia-maternidad-subsidio-essalud-peru","slug":"calculadora-licencia-maternidad-subsidio-essalud-peru","h1":"Calculadora de licencia de maternidad y subsidio EsSalud (Perú)","title":"Calculadora Licencia de Maternidad Perú 2026: 98 Días EsSalud","category":"familia","icon":"🤰","scope":"Calcula los días de descanso (pre/postnatal) y el subsidio EsSalud según la remuneración promedio de los últimos 12 meses. Dato 2026: 98 días (Ley 26644), +30 días por parto múltiple; subsidio = remuneración diaria promedio × días."},{"formulaId":"licencia-paternidad-peru","slug":"calculadora-licencia-paternidad-peru","h1":"Calculadora de licencia de paternidad (Perú)","title":"Calculadora Licencia de Paternidad Perú 2026: Días Pagados","category":"familia","icon":"👨‍🍼","scope":"Determina los días hábiles de licencia por paternidad y su valor pagado por el empleador según supuesto (parto normal, prematuro, múltiple). Dato 2026: 10 días hábiles base (Ley 30807), ampliables a 20-30 días en casos especiales."},{"formulaId":"retiro-cts-desempleo-peru","slug":"calculadora-retiro-cts-desempleo-peru","h1":"Calculadora de retiro de CTS por desempleo (Perú)","title":"Calculadora Retiro CTS Perú 2026: Cuánto Puedes Disponer","category":"familia","icon":"💼","scope":"Calcula el monto disponible de CTS para retiro según las leyes de libre disponibilidad y el saldo intangible (4 sueldos). Dato 2026: ley de disponibilidad del 100% de CTS vigente, con tope intangible de 4 remuneraciones brutas."},{"formulaId":"soat-peru-precio","slug":"calculadora-soat-peru-precio","h1":"Calculadora de precio del SOAT (Perú)","title":"Calculadora SOAT Perú 2026: Precio por Tipo de Vehículo","category":"automotor","icon":"🚗","scope":"Estima el precio del SOAT según tipo de vehículo (auto particular, taxi, moto, transporte) y región (Lima vs AFOCAT en provincias). Dato 2026: rangos de prima SOAT/AFOCAT por categoría vehicular vigentes en el mercado peruano."},{"formulaId":"impuesto-vehicular-peru","slug":"calculadora-impuesto-vehicular-peru","h1":"Calculadora del impuesto vehicular (Perú)","title":"Calculadora Impuesto Vehicular Perú 2026: 1% del Autovalúo","category":"automotor","icon":"🚙","scope":"Calcula el impuesto al patrimonio vehicular según el valor de adquisición/autovalúo y la antigüedad del vehículo. Dato 2026: tasa 1% sobre el valor, antigüedad ≤3 años, con piso de 1,5% de la UIT (UIT 2026 = S/ 5.500)."},{"formulaId":"revision-tecnica-vehicular-peru","slug":"calculadora-revision-tecnica-vehicular-peru","h1":"Calculadora de revisión técnica vehicular (Perú)","title":"Calculadora Revisión Técnica Vehicular Perú 2026: Costo y Multa","category":"automotor","icon":"🔧","scope":"Estima el costo de la RTV según tipo de vehículo y la multa por circular sin inspección vigente. Dato 2026: tarifas de centros de inspección técnica (MTC) y multa por RTV vencida en UIT (UIT 2026 = S/ 5.500)."},{"formulaId":"credito-vehicular-peru","slug":"calculadora-credito-vehicular-peru","h1":"Calculadora de crédito vehicular (Perú)","title":"Calculadora Crédito Vehicular Perú 2026: Cuota y TCEA","category":"automotor","icon":"🏦","scope":"Calcula la cuota mensual, TCEA e intereses totales de un crédito vehicular según monto, cuota inicial y plazo. Dato 2026: rangos de TCEA del mercado peruano de bancos para créditos vehiculares en soles y dólares."},{"formulaId":"impuesto-predial-peru","slug":"calculadora-impuesto-predial-peru","h1":"Calculadora del impuesto predial (Perú)","title":"Calculadora Impuesto Predial Perú 2026: Tramos en UIT","category":"impuestos","icon":"🏘️","scope":"Calcula el impuesto predial municipal anual según el autovalúo del predio aplicando los tramos progresivos en UIT. Dato 2026: tasas 0,2% (hasta 15 UIT = S/ 82.500), 0,6% (15-60 UIT) y 1,0% (>60 UIT), UIT 2026 S/ 5.500."},{"formulaId":"impuesto-alcabala-peru","slug":"calculadora-impuesto-alcabala-peru","h1":"Calculadora del impuesto de alcabala (Perú)","title":"Calculadora Alcabala Perú 2026: 3% al Comprar Inmueble","category":"impuestos","icon":"📜","scope":"Calcula la alcabala al comprar un inmueble sobre el valor de transferencia menos el tramo exento. Dato 2026: tasa 3% sobre el exceso de 10 UIT exentas (S/ 55.000 con UIT 2026 de S/ 5.500), a cargo del comprador."},{"formulaId":"itf-peru","slug":"calculadora-itf-peru","h1":"Calculadora del ITF (Impuesto a las Transacciones Financieras, Perú)","title":"Calculadora ITF Perú 2026: 0,005% por Operación Bancaria","category":"impuestos","icon":"🏧","scope":"Calcula el ITF retenido por operaciones bancarias (depósitos, transferencias, retiros) según el monto movido. Dato 2026: tasa vigente 0,005% por operación gravada (Ley 28194) sobre cuentas afectas."},{"formulaId":"renta-segunda-categoria-ganancia-capital-peru","slug":"calculadora-renta-segunda-categoria-ganancia-capital-peru","h1":"Calculadora de renta de 2da categoría (ganancia de capital, Perú)","title":"Calculadora Renta 2da Categoría Perú 2026: Venta de Acciones","category":"impuestos","icon":"📈","scope":"Calcula el impuesto a la renta de segunda categoría por venta de inmuebles, acciones o dividendos según costo y precio de venta. Dato 2026: tasa efectiva 5% sobre la ganancia (6,25% sobre renta neta tras 20% deducción) y 5% en dividendos."},{"formulaId":"regimen-especial-renta-rer-peru","slug":"calculadora-regimen-especial-renta-rer-peru","h1":"Calculadora del Régimen Especial de Renta (RER, Perú)","title":"Calculadora RER Perú 2026: Cuota 1,5% Mensual SUNAT","category":"impuestos","icon":"🧾","scope":"Calcula el pago mensual del RER y verifica si el negocio cumple los topes para acogerse. Dato 2026: cuota 1,5% de ingresos netos mensuales, tope de S/ 525.000 de ingresos/compras anuales y máximo 10 trabajadores (SUNAT)."},{"formulaId":"regimen-mype-tributario-rmt-peru","slug":"calculadora-regimen-mype-tributario-rmt-peru","h1":"Calculadora del Régimen MYPE Tributario (RMT, Perú)","title":"Calculadora RMT Perú 2026: Pago a Cuenta y Renta Anual","category":"negocios","icon":"🏪","scope":"Calcula el pago a cuenta mensual y el impuesto a la renta anual de una mype en el RMT según ingresos y utilidad. Dato 2026: pago a cuenta 1% hasta 300 UIT (S/ 1.650.000), renta anual 10% hasta 15 UIT de utilidad y 29,5% el exceso."},{"formulaId":"impuesto-renta-empresa-regimen-general-peru","slug":"calculadora-impuesto-renta-empresa-regimen-general-peru","h1":"Calculadora del impuesto a la renta de empresas (Régimen General, Perú)","title":"Calculadora Impuesto Renta Empresa Perú 2026: 29,5% General","category":"negocios","icon":"🏢","scope":"Calcula el impuesto a la renta de tercera categoría del Régimen General sobre la utilidad neta imponible y el pago a cuenta mensual. Dato 2026: tasa 29,5% sobre la renta neta y pago a cuenta por coeficiente o 1,5% de ingresos (SUNAT)."},{"formulaId":"costo-constitucion-empresa-peru","slug":"calculadora-costo-constitucion-empresa-peru","h1":"Calculadora del costo de constituir una empresa (Perú)","title":"Calculadora Costo Constituir Empresa Perú 2026: SAC y EIRL","category":"negocios","icon":"📋","scope":"Suma notaría, registros públicos (Sunarp), capital y trámites RUC para estimar el costo de abrir una empresa. Dato 2026: tasas registrales Sunarp en UIT (UIT S/ 5.500), constitución vía SID-Sunarp y costos notariales de mercado."},{"formulaId":"credito-hipotecario-peru","slug":"calculadora-credito-hipotecario-peru","h1":"Calculadora de crédito hipotecario (Perú)","title":"Calculadora Crédito Hipotecario Perú 2026: Cuota y TCEA","category":"finanzas","icon":"🏡","scope":"Calcula la cuota mensual, TCEA e intereses totales de un crédito hipotecario según precio, cuota inicial y plazo, con opción Mivivienda. Dato 2026: rangos de TCEA del mercado peruano y Bono del Buen Pagador del Fondo Mivivienda vigente."},{"formulaId":"prestamo-personal-tcea-peru","slug":"calculadora-prestamo-personal-tcea-peru","h1":"Calculadora de préstamo personal (TCEA, Perú)","title":"Calculadora Préstamo Personal Perú 2026: Cuota y TCEA Real","category":"finanzas","icon":"💵","scope":"Calcula la cuota mensual y el costo total de un préstamo personal a partir de la TCEA, monto y plazo. Dato 2026: tasas tope del BCRP para créditos de consumo en soles y rangos de TCEA de la banca peruana."},{"formulaId":"tarjeta-credito-pago-minimo-peru","slug":"calculadora-tarjeta-credito-pago-minimo-peru","h1":"Calculadora de tarjeta de crédito y pago mínimo (Perú)","title":"Calculadora Tarjeta de Crédito Perú 2026: Trampa del Pago Mínimo","category":"finanzas","icon":"💳","scope":"Muestra cuánto tardas en pagar y cuántos intereses acumulas pagando solo el mínimo de la tarjeta. Dato 2026: tasas tope (TEA) del BCRP para tarjetas de crédito de consumo en el sistema peruano."},{"formulaId":"deposito-plazo-fijo-peru","slug":"calculadora-deposito-plazo-fijo-peru","h1":"Calculadora de depósito a plazo fijo (Perú)","title":"Calculadora Plazo Fijo Perú 2026: Rendimiento y TREA","category":"finanzas","icon":"🐖","scope":"Calcula el rendimiento final de un depósito a plazo fijo según monto, plazo y TREA, con cobertura del FSD. Dato 2026: rangos de TREA de bancos, cajas y financieras y cobertura del Fondo de Seguro de Depósitos (~S/ 124.000)."},{"formulaId":"retiro-afp-jubilacion-peru","slug":"calculadora-retiro-afp-jubilacion-peru","h1":"Calculadora de retiro AFP 95,5% y jubilación (Perú)","title":"Calculadora Retiro AFP Perú 2026: 95,5% del Fondo o Pensión","category":"finanzas","icon":"📊","scope":"Proyecta el saldo del fondo AFP al jubilarte y compara retirar el 95,5% contra recibir pensión mensual. Dato 2026: modalidad de retiro 95,5% para afiliados de 65+ años (reforma de pensiones Ley 32123) y aporte obligatorio 10%."},{"formulaId":"costo-universidad-privada-peru","slug":"calculadora-costo-universidad-privada-peru","h1":"Calculadora del costo de la universidad privada (Perú)","title":"Calculadora Costo Universidad Privada Perú 2026: Pensión Total","category":"educacion","icon":"🎓","scope":"Proyecta el costo total de una carrera según pensión mensual/cuotas por ciclo, número de ciclos y matrícula. Dato 2026: rangos de pensión de universidades privadas peruanas (S/ 650 a S/ 5.500/mes según universidad y carrera)."}]

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    formulaId: { type: 'string' },
    slug: { type: 'string' },
    builtOk: { type: 'boolean', description: 'true solo si formula .ts compila con tsx Y el JSON parsea' },
    dataClaims: { type: 'array', items: { type: 'string' }, description: 'cada dato/valor/tasa 2026 usado + su fuente, para auditoría' },
    notes: { type: 'string' },
  },
  required: ['formulaId','slug','builtOk','dataClaims'],
}
const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    verdict: { type: 'string', enum: ['ok','fixed','broken'] },
    dataAccurate: { type: 'boolean' },
    issuesFound: { type: 'array', items: { type: 'string' } },
    fixesApplied: { type: 'array', items: { type: 'string' } },
  },
  required: ['slug','verdict','dataAccurate','issuesFound'],
}

const refNote = `REFERENCIAS DE ORO (leelas con Read ANTES de escribir):
- JSON gold-standard: src/content/calcs-pe/sueldo-neto-peru.json (TODOS los campos del schema + calidad esperada).
- Fórmula gold-standard: src/lib/formulas/essalud-aporte-peru.ts (patrón compute() + _insight + _chart).
- Data canónica: src/lib/data/${DATALIB}.ts (importá de acá lo que exista, ruta '../data/${DATALIB}.ts').
- Schema/validación: src/content.config.ts (campos requeridos; audience enum tiene "${AUD}").`

log(`Construyendo ${SPECS.length} calcs para ${CNAME}`)

const built = await pipeline(
  SPECS,
  (spec) => agent(
`Construí UNA calculadora completa para ${CNAME} en el repo hacecuentas (Astro). Tu salida es el structured output, pero el TRABAJO es escribir 2 archivos REALES en el repo.

CALC ASIGNADA:
- formulaId: ${spec.formulaId}  ·  slug: ${spec.slug}
- h1: ${spec.h1}  ·  title: ${spec.title}
- category: ${spec.category}  ·  icon: ${spec.icon}
- scope: ${spec.scope}

${refNote}

PASOS:
1. Leé las 4 referencias (Read). Copiá el patrón EXACTO.
2. Investigá la data 2026 REAL de ${CNAME} para esta calc (WebSearch/WebFetch a oficiales: ${SOURCES}). Anotá cada valor con su fuente.
3. Escribí la FÓRMULA en src/lib/formulas/${spec.formulaId}.ts:
   - export interface Inputs / Outputs; export function compute(i: Inputs): Outputs.
   - Importá de '../data/${DATALIB}.ts' lo que exista (UIT, RMV, fmtPEN...). Si un dato NO está, hardcodealo con comentario "// fuente: <org>, <url>, 2026".
   - Validá inputs (throw new Error claro si faltan/0). Montos en ${CURRENCY}.
   - Devolvé outputs formateados + _insight {title,text con **negritas**,tone,icon} + _chart (doughnut o bar) como el gold-standard.
   - Math CORRECTA y trazable. PROHIBIDO placeholder tipo v1*v2.
4. Escribí el JSON en src/content/calcs-pe/${spec.formulaId}.json con TODOS los campos del gold-standard:
   slug:"${spec.slug}", title:"${spec.title}", h1:"${spec.h1}", description, category:"${spec.category}", audience:"${AUD}", icon:"${spec.icon}", formulaId:"${spec.formulaId}", answerSnippet (con cifras 2026), intro (2-3 párrafos markdown), keyTakeaway, useCases (8-10), fields (coinciden con Inputs), outputs (coinciden con Outputs, uno primary:true), example {title,steps[],result}, explanation (markdown largo con tablas y links internos a /pe/<slug-existente>), faq (MÍNIMO 8, con cifras), sources (2-4 URLs REALES verificadas), relatedSlugs:[], dataUpdate {frequency,lastUpdated:"2026-06-15",updateType:"manual",notes,source,sourceUrl}, seoKeywords (6-8), lastReviewed:"2026-06-15".
5. VALIDÁ antes de cerrar:
   - \`npx tsx -e "import('./src/lib/formulas/${spec.formulaId}.ts').then(m=>{const o=m.compute(<caso ejemplo válido>);console.log(JSON.stringify(o))})"\` → sin error, sin NaN/undefined/Infinity en los valores.
   - JSON parsea: \`node -e "JSON.parse(require('fs').readFileSync('src/content/calcs-pe/${spec.formulaId}.json','utf8'))"\`.

YMYL: data 2026 EXACTA, fuentes oficiales reales (no inventes URLs ni normas). FAQ ≥8. Si no podés verificar un valor, usá el oficial más reciente y aclaralo en dataUpdate.notes.
Devolvé el structured output: dataClaims = cada cifra/tasa 2026 + su fuente.`,
    { label: `build:${spec.formulaId}`, phase: 'Build', schema: BUILD_SCHEMA, agentType: 'general-purpose' }
  ),
  (b, spec) => {
    const fid = (b && b.formulaId) || spec.formulaId
    const slug = spec.slug
    if (!b) return { slug, verdict: 'broken', dataAccurate: false, issuesFound: ['build agent murió/null'] }
    return agent(
`Auditor adversarial YMYL. Revisá la calc recién construida para ${CNAME} y CORREGÍ lo que esté mal directamente en los archivos.

ARCHIVOS:
- src/lib/formulas/${fid}.ts
- src/content/calcs-pe/${fid}.json

DATA CLAIMS del builder (verificá CADA UNO vs fuente oficial 2026 con WebSearch/WebFetch — ${SOURCES}):
${(b.dataClaims||[]).map(d => '- ' + d).join('\n') || '- (no reportó; auditá igual cada cifra)'}

CHEQUEÁ Y ARREGLÁ:
1. DATA 2026: cada tasa/monto/tope/norma es la VIGENTE 2026 de ${CNAME}. Buscá normas derogadas/desactualizadas. Si algo está mal → corregilo en el .ts Y en el JSON (answerSnippet/example/explanation/faq/dataUpdate).
2. FÓRMULA: math correcta y trazable (no placeholders). Compilá con tsx y corré un caso: sin NaN/undefined/Infinity. fields↔Inputs, outputs↔Outputs.
3. SCHEMA: FAQ ≥8, useCases 8-10, sources con URLs reales que resuelven, audience "${AUD}", dataUpdate completo, lastReviewed 2026-06-15. Links internos en explanation a slugs que EXISTAN en src/content/calcs-pe/.
4. JSON parsea.

Encontraste errores → ARREGLALOS (Edit/Write) y verdict:"fixed". Todo bien → "ok". Roto sin arreglo → "broken". Escéptico: ante duda, verificá en la fuente.`,
      { label: `verify:${fid}`, phase: 'Verify', schema: VERIFY_SCHEMA, agentType: 'general-purpose' }
    )
  }
)

const results = built.filter(Boolean)
const ok = results.filter(r => r.verdict === 'ok' || r.verdict === 'fixed')
const broken = results.filter(r => r.verdict === 'broken')
log(`${CNAME}: ${ok.length} OK/fixed · ${broken.length} broken (de ${SPECS.length})`)
return {
  country: COUNTRY,
  planned: SPECS.length,
  okCount: ok.length,
  brokenCount: broken.length,
  okSlugs: ok.map(r => r.slug),
  brokenSlugs: broken.map(r => r.slug),
  detail: results.map(r => ({ slug: r.slug, verdict: r.verdict, dataAccurate: r.dataAccurate, issues: (r.issuesFound||[]).slice(0,4) })),
}
