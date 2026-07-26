# Propuesta resolución calcs en limbo — 2026-07-26

**Regla Martin:** calc 100% operativa o borrada con 301 — nunca el limbo. Excepción: YMYL-**vida** (dosis/bebés/clínica) SÍ puede llevar cartel; **Money NO se apaga**.

## Método
- Inventario sobre `src/content/calcs*/` con la misma lógica de `src/lib/content-policy.ts`: limbo = `distribution:'restricted'` **o** `ymylRisk:'high'` sin `professionalReviewer` válido **o** `status:'draft'` **o** `noindex:true`.
- Cruce con `src/lib/pruning-redirects.ts` + `src/lib/gone-410.ts` (URL ya muerta = solo falta limpiar el JSON) y con `data/bing-perf-latest.json` (impresiones Bing; el canal es Bing 85%).
- Nota: el schema `professionalReviewer` **SÍ existe** hoy (`src/content.config.ts:71`), pero **cero calcs lo usan** — el bloqueo real es que no hay revisor humano, no el schema.

## Resumen ejecutivo
- **Total en limbo efectivo: 139** (no 220: 81 noindex huérfanas ya se revertieron el 7-26, `e99fd9145`).
- **D — Limpieza de muertas: 46** JSON cuyo URL ya tiene 301/410 pero el archivo sigue en el repo. Cero riesgo, cero decisión: borrar JSON+fórmula+imports, `npm run related`. **Lote 1 recomendado.**
- **A — Money / no-salud a REHABILITAR: 28** (Money no se apaga). Mayoría `draft+restricted` del incidente; verificar dato → bump `lastReviewed` → sacar `distribution/draft/noindex`.
- **B — YMYL-vida real: 65**, de las cuales:
  - **B1 mantener con cartel (24)**: dosis/bebés/lesión en ES/LATAM — la excepción las cubre; solo validar que `restrictedMode` sea el correcto (dose/baby/injury, no 'editorial').
  - **B2 decidir borrar-o-cartel (41)**: mayormente `/en/` salud clínica con 0 impresiones Bing — candidatas a BORRAR con 301 (destino propuesto por fila). Conseguir reviewer para /en no tiene ROI.
- Tráfico: **solo 1 de 139 tiene impresiones Bing** (`/calculadora-imc-infantil-percentil`, 68 impr, ya redirigida y además es la canibalización IMC pediátrico-vs-infantil pendiente de decisión de Martin). El limbo no está costando tráfico hoy; está costando crawl budget e higiene.

## Lote 1 — Limpieza de muertas (46, esfuerzo BAJO, ~1 sesión)
URL ya en `pruning-redirects.ts`/`gone-410.ts`; el JSON es un resabio. Acción: borrar `src/content/<dir>/<slug>.json` + fórmula + import, `npm run related`, build. Sin tocar `_redirects` (ya existe).

| URL (ya muerta) | cat | estado JSON | impr Bing |
|---|---|---|---|
| `/calculadora-autonomia-tanque-lleno-kilometros` | automotor | restricted, draft, noindex | 0 |
| `/calculadora-cafeina-dosis-rendimiento` | deportes | restricted, ymyl-high sin reviewer, noindex | 0 |
| `/calculadora-calcio-diario-edad-lactancia-menopausia` | salud | restricted, ymyl-high sin reviewer, noindex | 0 |
| `/calculadora-creatina-dosis-carga-mantenimiento` | deportes | restricted, ymyl-high sin reviewer, noindex | 0 |
| `/calculadora-descenso-futbol-argentino-promedios` | deportes | noindex | 0 |
| `/calculadora-dosis-medicamento-mascota-por-peso` | mascotas | restricted, ymyl-high sin reviewer, noindex | 0 |
| `/calculadora-edad-corregida-prematuro` | salud | ymyl-high sin reviewer | 0 |
| `/calculadora-edad-gestacional-corregida-prematuro` | familia | ymyl-high sin reviewer | 0 |
| `/calculadora-imc-infantil-percentil` | salud | restricted, ymyl-high sin reviewer, noindex | 68 |
| `/calculadora-inflacion-perdida-poder-adquisitivo` | finanzas | restricted, draft, noindex | 0 |
| `/calculadora-ovulacion-dias-fertiles` | salud | restricted, draft, noindex | 0 |
| `/calculadora-percentil-bebe-oms` | salud | ymyl-high sin reviewer | 0 |
| `/calculadora-percentil-peso-bebe-oms-edad-meses` | familia | ymyl-high sin reviewer | 0 |
| `/calculadora-perimetro-abdominal-riesgo-cardiovascular` | salud | ymyl-high sin reviewer | 0 |
| `/calculadora-peso-ideal-bebe-mes-percentil` | salud | ymyl-high sin reviewer | 0 |
| `/calculadora-premios-copa-argentina-por-ronda` | deportes | restricted, draft, noindex | 0 |
| `/calculadora-vacunas-bebe-calendario-2026-argentina-edad` | salud | restricted, ymyl-high sin reviewer, noindex | 0 |
| `/cl/calculadora-pension-de-alimentos-mora-chile-registro-deudores` | familia | restricted, draft, noindex | 0 |
| `/cl/calculadora-pension-viudez-vitalicia-chile-cuantia` | familia | restricted, draft, noindex | 0 |
| `/co/calculadora-pension-alimentos-colombia-padre-divorcio-tabla` | familia | restricted, draft, noindex | 0 |
| `/ec/calculadora-horas-extra-suplementarias-ecuador` | finanzas | restricted, draft, noindex | 0 |
| `/en/3d-print-cost-per-part` | tecnologia | noindex | 0 |
| `/en/baby-diaper-calculator` | familia | noindex | 0 |
| `/en/caregiver-child-ratio-by-age` | familia | noindex | 0 |
| `/en/choking-heimlich-age-maneuver` | salud | ymyl-high sin reviewer | 0 |
| `/en/creatine-loading-maintenance` | salud | restricted, ymyl-high sin reviewer, noindex | 0 |
| `/en/critical-power-cp` | deportes | noindex | 0 |
| `/en/gestational-age-calculator` | salud | restricted, draft, noindex | 0 |
| `/en/ira-401k-argentina-equivalent` | finanzas | noindex | 0 |
| `/en/irregular-fertile-window` | salud | restricted, draft, noindex | 0 |
| `/en/male-fertility-age` | salud | restricted, draft, ymyl-high sin reviewer, noindex | 0 |
| `/en/midjourney-stable-diffusion-credits-monthly` | tecnologia | noindex | 0 |
| `/en/position-size-stocks-percentage` | finanzas | noindex | 0 |
| `/en/safe-deposit-box-bank-cost-comparison` | finanzas | noindex | 0 |
| `/en/spf-sun-protection-minutes-skin-type` | salud | ymyl-high sin reviewer | 0 |
| `/en/sports-hydration-electrolytes-exercise` | salud | restricted, ymyl-high sin reviewer, noindex | 0 |
| `/en/stopping-distance-speed-friction` | automotor | noindex | 0 |
| `/en/study-abroad-costs-budget` | educacion | noindex | 0 |
| `/en/timing-belt-change-interval-km` | automotor | noindex | 0 |
| `/en/vitamin-d-dosage-daily-sun-exposure-age` | salud | restricted, ymyl-high sin reviewer, noindex | 0 |
| `/mx/calculadora-pension-viudez-imss-90-porcentaje-mexico` | familia | restricted, draft, noindex | 0 |
| `/mx/calculadora-pension-viudez-vs-pension-alimenticia-mexico` | familia | restricted, draft, noindex | 0 |
| `/pt/calculadora-ovulacao-periodo-fertil-ciclo` | familia | restricted, draft, noindex | 0 |
| `/pt/cbc-uba-materias-regularidade-requisitos` | educacion | noindex | 0 |
| `/pt/midjourney-creditos-mensais` | tecnologia | noindex | 0 |
| `/pt/tempos-cozimento-verduras-vapor-cozido` | cocina | noindex | 0 |

## Lote 2 — Rehabilitar Money / no-salud (28, esfuerzo MEDIO, ~1-2 sesiones)
Por calc: (1) verificar dato/fórmula contra fuente oficial (regla: siempre el valor más fresco), (2) FAQ ≥7, (3) quitar `distribution:'restricted'`, `status:'draft'`, `noindex`, (4) bump `lastReviewed`. Incluye las mal clasificadas como 'dose' por hints del slug (pensión de alimentos, indemnización embarazo, etc. = plata/legal, no salud).

| URL | cat | por qué está en limbo | impr Bing |
|---|---|---|---|
| `/calculadora-blog-adsense-rpm-nicho` | marketing | restricted, draft, noindex | 0 |
| `/calculadora-costo-real-cuotas-vs-contado` | finanzas | restricted, draft, noindex | 0 |
| `/calculadora-costo-salida-cancha-argentina` | deportes | restricted, draft, noindex | 0 |
| `/calculadora-costo-streaming-argentina` | vida | restricted, draft, noindex | 0 |
| `/calculadora-dias-vacaciones-me-alcanza` | viajes | restricted, draft, noindex | 0 |
| `/calculadora-edad-humana-por-raza-perro` | mascotas | restricted, draft, noindex | 0 |
| `/calculadora-edad-quitar-panal-control-esfinteres` | familia | restricted, draft, noindex | 0 |
| `/calculadora-indemnizacion-despido-embarazo-estabilidad-13-salarios` | finanzas | restricted, draft, noindex | 0 |
| `/calculadora-ovulos-congelados-vitrificacion-precio-clinica` | vida | restricted, draft, noindex | 0 |
| `/calculadora-poda-frecuencia-arbol-especie` | jardineria | restricted, draft, noindex | 0 |
| `/calculadora-puntos-necesarios-clasificar-futbol` | deportes | restricted, draft, noindex | 0 |
| `/calculadora-talla-zapato-bebe` | salud | restricted, draft, noindex | 0 |
| `/calculadora-tiempo-maraton-predictor` | deportes | restricted, draft, noindex | 0 |
| `/calculadora-ups-autonomia-potencia-carga` | electronica | noindex | 0 |
| `/cl/calculadora-sii-boleta-honorarios-2026` | impuestos | ymyl-high sin reviewer | 0 |
| `/co/calculadora-credito-hipotecario-davivienda-cuota` | finanzas | restricted, draft, noindex | 0 |
| `/co/calculadora-edad-escolar-simat-colombia` | vida | restricted, draft, noindex | 0 |
| `/co/calculadora-fecha-limite-secop-dias-habiles` | negocios | draft, noindex | 0 |
| `/co/calculadora-hora-fin-programa-rcn` | vida | restricted, draft, noindex | 0 |
| `/co/calculadora-limites-retiro-recarga-nequi` | finanzas | restricted, draft, noindex | 0 |
| `/co/calculadora-redam-cuotas-alimentarias-mora` | vida | draft, noindex | 0 |
| `/co/calculadora-retiro-cesantias-porvenir` | finanzas | restricted, draft, noindex | 0 |
| `/en/fertilizante-npk-dosis` | jardineria | restricted, draft, noindex | 0 |
| `/en/paint-coverage-liters-per-square-meter` | construccion | noindex | 0 |
| `/en/us-b1-b2-tourist-visa-cost` | finanzas | noindex | 0 |
| `/en/used-car-transfer-cost` | finanzas | noindex | 0 |
| `/es/calculadora-pension-alimenticia-divorcio-espana-tabla` | familia | restricted, draft, noindex | 0 |
| `/pe/calculadora-pension-alimentos-peru` | familia | restricted, draft, noindex | 0 |

## Lote 3 — B1: YMYL-vida que se quedan con cartel (24, esfuerzo BAJO)
Cubiertas por la excepción. Acción única: auditar que `restrictedMode` declarado sea el correcto (dose/baby/injury/clinical) para que el cartel no mienta, y confirmar `noindex` coherente. No requieren decisión.

| URL | cat | modo cartel | impr Bing |
|---|---|---|---|
| `/calculadora-alimentacion-complementaria` | salud | baby | 0 |
| `/calculadora-bcaa-pre-workout-gramos` | salud | dose | 0 |
| `/calculadora-cafeina-dosis-segura-diaria-peso` | salud | dose | 0 |
| `/calculadora-dosis-antiparasitario-perro-gato-peso` | mascotas | dose | 0 |
| `/calculadora-dosis-antipulgas-peso-mascota` | mascotas | dose | 0 |
| `/calculadora-exposicion-sol-vitamina-d` | salud | dose | 0 |
| `/calculadora-fertilidad-masculina-edad` | salud | dose | 0 |
| `/calculadora-formula-infantil-biberon-edad-ml-dia` | familia | baby | 0 |
| `/calculadora-formula-leche-bebe-litros-mes-edad-marca` | familia | baby | 0 |
| `/calculadora-hidratacion-corredor-maraton-carrera` | deportes | dose | 0 |
| `/calculadora-homa-ir-quicki` | salud | dose | 0 |
| `/calculadora-leche-formula-biberon-cantidad-peso-bebe` | familia | baby | 0 |
| `/calculadora-leche-materna-formula` | salud | baby | 0 |
| `/calculadora-magnesio-dosis-deficiencia-sintomas` | salud | dose | 0 |
| `/calculadora-magnesio-glicinato-vs-citrato-vs-malato-dosis` | salud | dose | 0 |
| `/calculadora-onzas-biberon-peso-bebe-dia` | familia | baby | 0 |
| `/calculadora-percentiles-crecimiento-pediatrico` | salud | dose | 0 |
| `/calculadora-protector-solar-spf-fototipo` | salud | dose | 0 |
| `/calculadora-pubalgia-atletica-tiempo-recuperacion-fases` | salud | injury | 0 |
| `/calculadora-spf-proteccion-solar-minutos-piel` | salud | dose | 0 |
| `/calculadora-tiempo-recuperacion-isquiotibial-grado-1-2-3` | salud | injury | 0 |
| `/calculadora-vitamina-d-dosis-sol-diaria-edad` | salud | dose | 0 |
| `/calculadora-whey-protein-dosis-diaria-scoop` | salud | dose | 0 |
| `/pt/cobaia-vitamina-c-dosagem-diaria` | mascotas | dose | 0 |

## Lote 4 — B2: borrar con 301 o dejar cartel — DECISIÓN MARTIN (41, esfuerzo MEDIO)
Salud clínica /en (35) + clínicas ES sin tráfico. 0 impresiones Bing en todas. Propuesta default: **BORRAR con 301** al destino indicado (no hay reviewer ni plan de conseguirlo, y el cartel 'clinical' en /en aporta poco). Alternativa sin costo: dejarlas en B1 con cartel.

| URL | cat | modo | 301 propuesto |
|---|---|---|---|
| `/calculadora-calcio-corregido-albumina` | salud | clinical | `/categoria/salud` |
| `/calculadora-clearance-creatinina-filtrado-glomerular` | salud | clinical | `/categoria/salud` |
| `/calculadora-cold-plunge-tiempo-temperatura-cortisol` | salud | clinical | `/categoria/salud` |
| `/calculadora-oxalatos-calculos-renales` | salud | clinical | `/categoria/salud` |
| `/calculadora-riesgo-embarazo-edad` | salud | clinical | `/categoria/salud` |
| `/calculadora-vacuna-calendario-nacional-anses` | familia | clinical | `/categoria/familia` |
| `/en/baby-feeding-amount-by-age-calculator` | familia | baby | `/en` |
| `/en/blood-alcohol-bac-widmark` | salud | clinical | `/en` |
| `/en/blood-pressure-normal-hypertension` | salud | clinical | `/en` |
| `/en/blood-pressure-who-classification` | salud | clinical | `/en` |
| `/en/breast-milk-formula` | salud | baby | `/en` |
| `/en/burnout-mbi-assessment` | salud | clinical | `/en` |
| `/en/cafeina-dosis-rendimiento` | deportes | dose | `/en` |
| `/en/cafeina-dosis-segura-diaria-peso` | salud | dose | `/en` |
| `/en/cholesterol-total-ldl-hdl-levels` | salud | clinical | `/en` |
| `/en/cpr-bls-chest-compressions-rate` | salud | dose | `/en` |
| `/en/daily-caffeine-safe-maximum-cups` | salud | dose | `/en` |
| `/en/epinephrine-dosage-weight-anaphylaxis` | salud | dose | `/en` |
| `/en/fasting-blood-glucose-levels` | salud | clinical | `/en` |
| `/en/fsh-lh-menopause-perimenopause-age` | salud | clinical | `/en` |
| `/en/guinea-pig-vitamin-c-daily-dosage` | mascotas | dose | `/en` |
| `/en/hemoglobin-a1c-diabetes-calculator` | salud | clinical | `/en` |
| `/en/infant-formula-bottle-ml-by-age` | familia | baby | `/en` |
| `/en/iron-ferritin-anemia` | salud | clinical | `/en` |
| `/en/magnesio-dosis-deficiencia-sintomas` | salud | dose | `/en` |
| `/en/magnesium-daily-requirement` | salud | dose | `/en` |
| `/en/omega-3-daily-dha-epa-dose` | salud | dose | `/en` |
| `/en/ovulation-fertile-window-calculator` | familia | dose | `/en` |
| `/en/pet-medication-dosage-by-weight` | mascotas | dose | `/en` |
| `/en/postpartum-depression-screening` | salud | clinical | `/en` |
| `/en/pregnancy-week-calculator` | salud | dose | `/en` |
| `/en/probiotic-daily-cfu-dosage` | salud | dose | `/en` |
| `/en/spermiogram-reference-values-who-2021` | salud | clinical | `/en` |
| `/en/stages-of-grief-family-loss` | familia | clinical | `/en` |
| `/en/superficie-corporal-du-bois` | salud | dose | `/en` |
| `/en/suplementos-deportivos-stack-principiante` | salud | dose | `/en` |
| `/en/testosterone-normal-levels-by-age-men` | salud | clinical | `/en` |
| `/en/vitamin-b12-dosage-vegan-monthly` | salud | dose | `/en` |
| `/en/vitamina-b12-vegano` | salud | dose | `/en` |
| `/en/whey-protein-daily-scoops` | salud | dose | `/en` |
| `/en/yodo-diario-embarazo` | salud | dose | `/en` |

## Orden recomendado
1. **Lote 1** (limpieza muertas): sin decisiones, libera el inventario 139→93.
2. **Lote 2** (Money rehabilitar): cumple la regla 'Money no se apaga'; es donde hay upside SEO.
3. **Lote 3** (auditar restrictedMode): rápido, deja el catálogo de salud en estado legal.
4. **Lote 4**: esperar OK de Martin borrar-vs-cartel antes de tocar `_redirects`.

*Generado en análisis 2026-07-26. No se editó ningún calc ni redirect.*