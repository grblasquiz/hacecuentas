/**
 * Aplica el resultado de la auditoría exhaustiva KEEP.
 *
 * Regla de seguridad:
 * - fórmula + fuentes automáticas OK: aprobación editorial autorizada por el
 *   propietario a partir del informe completo;
 * - cualquier evidencia pendiente: la página se conserva, pero queda noindex
 *   y sin anuncios hasta una revisión posterior.
 *
 * El script aborta si el informe no cubre las 1.844 KEEP o si alguna fórmula
 * falla, para impedir aprobaciones parciales o accidentales.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const REPORT = JSON.parse(readFileSync(resolve(ROOT, 'reports/editorial-keep-verification.json'), 'utf8'));
const REVIEW_DATE = '2026-07-14';
const EXPECTED_KEEP = 1844;

if (REPORT?.summary?.keep !== EXPECTED_KEEP || REPORT?.rows?.length !== EXPECTED_KEEP) {
  throw new Error(`Informe incompleto: esperaba ${EXPECTED_KEEP} KEEP y encontré ${REPORT?.rows?.length ?? 0}`);
}
if (REPORT.summary.formulaPassed !== EXPECTED_KEEP || REPORT.summary.formulaFailed !== 0) {
  throw new Error(`Gate de fórmulas falló: ${REPORT.summary.formulaPassed}/${EXPECTED_KEEP}`);
}

let approved = 0;
let quarantined = 0;

for (const row of REPORT.rows) {
  const file = resolve(ROOT, row.file);
  const calc = JSON.parse(readFileSync(file, 'utf8'));

  calc.automatedTests = 'passed';
  calc.sourceCheckedAt = REVIEW_DATE;
  calc.editorialAudit = {
    reviewedAt: REVIEW_DATE,
    scope: 'full-keep-corpus',
    formulaTest: 'passed',
    sourceCheck: row.sourceAutomatedReady ? 'passed' : 'needs-review',
    approvalBasis: 'owner-authorized exhaustive automated evidence report',
  };

  if (row.sourceAutomatedReady) {
    calc.sourceAutomatedCheck = 'passed';
    calc.sourceVerified = true;
    calc.editorialReview = 'approved';
    calc.editorialReviewer = 'Martín Rodríguez';
    calc.editorialReviewedAt = REVIEW_DATE;
    // Sólo quitamos la cuarentena creada por este mismo gate.
    if (calc.editorialGateQuarantine === true) {
      delete calc.noindex;
      delete calc.adsenseEligible;
      delete calc.editorialGateQuarantine;
    }
    approved++;
  } else {
    calc.sourceAutomatedCheck = 'needs-review';
    calc.sourceVerified = false;
    calc.editorialReview = 'pending';
    calc.noindex = true;
    calc.adsenseEligible = false;
    calc.editorialGateQuarantine = true;
    quarantined++;
  }

  writeFileSync(file, `${JSON.stringify(calc, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify({ keep: EXPECTED_KEEP, approved, quarantined, reviewDate: REVIEW_DATE }, null, 2));
