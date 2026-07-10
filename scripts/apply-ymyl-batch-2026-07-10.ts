/**
 * apply-ymyl-batch-2026-07-10.ts — Cuarta tanda YMYL. Restringe las 12 páginas
 * clínicas reales detectadas por el audit del 2026-07-09 (returnsDoseOrTreatment
 * && currentlyIndexable). Se excluyeron 4 falsos positivos del audit que NO
 * devuelven dosis/tratamiento: PAMI (finanzas), IVA bienes exentos Colombia
 * (impuestos), costo-FIV (costos) y días-sin-fumar (ahorro).
 *
 * Lista HARDCODEADA e idempotente: sólo agrega los campos de política si faltan.
 *
 *   node --experimental-strip-types scripts/apply-ymyl-batch-2026-07-10.ts
 *
 * A cada calc le agrega:
 *   ymylRisk: "high", reviewType: "editorial", distribution: "restricted",
 *   noindex: true, restrictedMode: <subgrupo>, lastReviewed: 2026-07-10
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const CONTENT = join(ROOT, 'src/content');
const TODAY = '2026-07-10';

// [colección, archivo (sin .json), subgrupo].
//   'dose'     → dosis real de suplemento/vitamina
//   'clinical' → interpretación de labs / screening / salud mental / protocolo
const BATCH: Array<[string, string, 'dose' | 'injury' | 'baby' | 'clinical']> = [
  // Dosis genuinas (suplemento/vitamina)
  ['calcs', 'exposicion-sol-vitamina-d', 'dose'],
  ['calcs-en', 'vitamin-b12-dosage-vegan-monthly', 'dose'],
  ['calcs-en', 'yodo-diario-embarazo', 'dose'],
  // Labs / screening / salud mental / protocolo de salud
  ['calcs', 'calculadora-cold-plunge-tiempo-temperatura-cortisol', 'clinical'],
  ['calcs-en', 'blood-pressure-normal-hypertension', 'clinical'],
  ['calcs-en', 'cholesterol-total-ldl-hdl-levels', 'clinical'],
  ['calcs-en', 'fasting-blood-glucose-levels', 'clinical'],
  ['calcs-en', 'hemoglobin-a1c-diabetes-calculator', 'clinical'],
  ['calcs-en', 'iron-ferritin-anemia', 'clinical'],
  ['calcs-en', 'burnout-mbi-assessment', 'clinical'],
  ['calcs-en', 'postpartum-depression-screening', 'clinical'],
  ['calcs-en', 'stages-of-grief-family-loss', 'clinical'],

  // === Segunda tanda 07-10: triage de las 71 high-indexable-sin-revisor ===
  // dose — dosis micronutriente/electrolitos con UL y daño por exceso
  ['calcs-en', 'agua-diaria-deportista', 'dose'],
  ['calcs', 'calcio-diario-edad-lactancia-menopausia', 'dose'],
  ['calcs', 'hidratacion-corredor', 'dose'],
  ['calcs-en', 'magnesio-dosis-deficiencia-sintomas', 'dose'],
  ['calcs-en', 'magnesium-daily-requirement', 'dose'],
  ['calcs-en', 'sports-hydration-electrolytes-exercise', 'dose'],
  ['calcs-en', 'suplementos-deportivos-stack-principiante', 'dose'],
  ['calcs-en', 'vitamin-d-dosage-daily-sun-exposure-age', 'dose'],
  // clinical — labs/screening/protocolo de salud individualizado
  ['calcs-en', 'blood-alcohol-bac-widmark', 'clinical'],
  ['calcs-en', 'blood-pressure-who-classification', 'clinical'],
  ['calcs', 'imc-infantil-percentil', 'clinical'],
  ['calcs', 'calculadora-oxalatos-calculos-renales', 'clinical'],
  ['calcs', 'riesgo-embarazo-edad', 'clinical'],
  ['calcs', 'vacuna-calendario-nacional-anses', 'clinical'],
  ['calcs', 'calculadora-vacunas-bebe-calendario-2026-argentina-edad', 'clinical'],
  ['calcs-en', 'fsh-lh-menopause-perimenopause-age', 'clinical'],
  ['calcs-en', 'spermiogram-reference-values-who-2021', 'clinical'],
  ['calcs-en', 'testosterone-normal-levels-by-age-men', 'clinical'],
];

let changed = 0, skipped = 0, missing = 0;
for (const [collection, slug, mode] of BATCH) {
  const p = join(CONTENT, collection, `${slug}.json`);
  if (!existsSync(p)) { console.warn(`  MISSING  ${collection}/${slug}`); missing++; continue; }
  const calc = JSON.parse(readFileSync(p, 'utf8'));
  const already =
    calc.ymylRisk === 'high' && calc.distribution === 'restricted' &&
    calc.noindex === true && calc.restrictedMode === mode;
  if (already) { console.log(`  skip     ${slug} (ya restringida)`); skipped++; continue; }
  calc.ymylRisk = 'high';
  calc.reviewType = 'editorial';
  calc.distribution = 'restricted';
  calc.noindex = true;
  calc.restrictedMode = mode;
  calc.lastReviewed = TODAY;
  writeFileSync(p, JSON.stringify(calc, null, 2) + '\n', 'utf8');
  console.log(`  RESTRICT ${slug} [${mode}]`);
  changed++;
}
console.log(`\n[ymyl-batch 07-10] restringidas=${changed}  ya-estaban=${skipped}  faltantes=${missing}`);
