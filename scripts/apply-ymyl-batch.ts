/**
 * apply-ymyl-batch.ts — Clasifica la PRIMERA TANDA de calculadoras de riesgo
 * alto (spec Fase 5). Lista HARDCODEADA e idempotente: sólo agrega los campos
 * de política si faltan; no toca el resto del contenido (el contenido fuente se
 * conserva en Git). Correr una vez:
 *
 *   node --experimental-strip-types scripts/apply-ymyl-batch.ts
 *
 * A cada calc le agrega:
 *   ymylRisk: "high", reviewType: "editorial", distribution: "restricted",
 *   noindex: true, restrictedMode: <subgrupo>, lastReviewed: <hoy>
 *
 * NO inventa revisores profesionales. El render (CalcLayoutV2 + content-policy)
 * desactiva el cálculo prescriptivo y suprime tablas/ejemplos/FAQ con números.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const CONTENT = join(ROOT, 'src/content');
const TODAY = '2026-07-02';

// [colección, archivo (sin .json), subgrupo]. Subgrupo: 'dose' (medicamentos/
// suplementos/dosis vet), 'injury' (lesiones/retorno deportivo), 'baby'.
const BATCH: Array<[string, string, 'dose' | 'injury' | 'baby']> = [
  // === Tanda AR (Fase 5) ===
  // A — medicamentos, suplementos y dosis veterinarias
  ['calcs', 'calculadora-magnesio-glicinato-vs-citrato-vs-malato-dosis', 'dose'],
  ['calcs', 'magnesio-dosis-deficiencia-sintomas', 'dose'],
  ['calcs', 'dosis-antipulgas-peso-mascota', 'dose'],
  ['calcs', 'dosis-mascota', 'dose'],
  ['calcs', 'dosis-antiparasitario', 'dose'],
  ['calcs', 'vitamina-d-dosis-sol-diaria-edad', 'dose'],
  ['calcs', 'whey-protein-dosis-diaria-scoop', 'dose'],
  ['calcs', 'creatina-dosis-carga-mantenimiento', 'dose'],
  ['calcs', 'cafeina-dosis-segura-diaria-peso', 'dose'],
  ['calcs', 'cafeina-dosis-rendimiento', 'dose'],
  // B — lesiones y retorno deportivo
  ['calcs', 'calculadora-pubalgia-atletica-tiempo-recuperacion-fases', 'injury'],
  ['calcs', 'calculadora-tiempo-recuperacion-isquiotibial-grado-1-2-3', 'injury'],
  // C — alimentación de bebés
  ['calcs', 'alimentacion-complementaria', 'baby'],
  ['calcs', 'leche-formula-biberon-cantidad-peso-bebe', 'baby'],

  // === Segunda tanda (Fase 11): dosis genuinas detectadas por el gate ===
  // AR faltante
  ['calcs', 'calculadora-bcaa-pre-workout-gramos', 'dose'],
  // EN — siblings de dosis y fármacos de riesgo alto
  ['calcs-en', 'cafeina-dosis-rendimiento', 'dose'],
  ['calcs-en', 'cafeina-dosis-segura-diaria-peso', 'dose'],
  ['calcs-en', 'creatine-loading-maintenance', 'dose'],
  ['calcs-en', 'epinephrine-dosage-weight-anaphylaxis', 'dose'],
  ['calcs-en', 'pet-medication-dosage-by-weight', 'dose'],
  ['calcs-en', 'superficie-corporal-du-bois', 'dose'],
  ['calcs-en', 'vitamina-b12-vegano', 'dose'],

  // === Tercera tanda: alimentación individualizada de bebés (dosis pediátrica) ===
  ['calcs', 'calculadora-formula-leche-bebe-litros-mes-edad-marca', 'baby'],
  ['calcs', 'formula-infantil-biberon-edad-ml-dia', 'baby'],  // filename≠slug
  ['calcs', 'onzas-biberon-peso-bebe-dia', 'baby'],           // filename≠slug
  ['calcs-en', 'baby-feeding-amount-by-age-calculator', 'baby'],
  ['calcs-en', 'breast-milk-formula', 'baby'],
  ['calcs-en', 'infant-formula-bottle-ml-by-age', 'baby'],
];

let changed = 0, skipped = 0, missing = 0;
for (const [collection, slug, mode] of BATCH) {
  const p = join(CONTENT, collection, `${slug}.json`);
  if (!existsSync(p)) { console.warn(`  MISSING  ${slug}`); missing++; continue; }
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
console.log(`\n[ymyl-batch] restringidas=${changed}  ya-estaban=${skipped}  faltantes=${missing}`);
