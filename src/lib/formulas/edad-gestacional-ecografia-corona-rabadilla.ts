// Calculadora de Edad Gestacional por Ecografía (LCC / DBP)
// Fuente LCC: Hadlock FP et al., Radiology 1992 — doi:10.1148/radiology.182.2.1732970
// Fuente DBP: Hadlock FP et al., Radiology 1984 — doi:10.1148/radiology.152.2.6739930
// Umbrales de corrección: ACOG Practice Bulletin 230 (2022)

export interface Inputs {
  method: string;        // 'lcc' | 'dbp'
  measurement_mm: number;
  use_fum: string;       // 'yes' | 'no'
  fum_date: string;      // ISO date string 'YYYY-MM-DD' o vacío
}

export interface Outputs {
  gest_age_label: string;
  fpp_eco: string;
  fpp_fum: string;
  discrepancy: string;
  recommendation: string;
}

// ── Constantes Hadlock ─────────────────────────────────────────────────────
// LCC (primer trimestre): EG (días) = 8.052 × √(LCC_mm) + 23.73
const LCC_A = 8.052;
const LCC_B = 23.73;
const LCC_MIN_MM = 10;
const LCC_MAX_MM = 84;

// DBP (2.º-3.er trimestre): EG (semanas) = 9.54 + 1.482×DBP_cm + 0.1676×DBP_cm²
const DBP_C0 = 9.54;
const DBP_C1 = 1.482;
const DBP_C2 = 0.1676;
const DBP_MIN_MM = 20;
const DBP_MAX_MM = 98;

// Umbrales de discrepancia para corrección de FPP (días)
const THRESHOLD_1ST = 7;
const THRESHOLD_2ND = 14;
const THRESHOLD_3RD = 21;

// Gestación completa asumida: 280 días
const FULL_GESTATION_DAYS = 280;

// ── Utilidades ────────────────────────────────────────────────────────────
function padZero(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86400000;
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}

function egDaysToLabel(totalDays: number): string {
  if (totalDays <= 0) return "—";
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  return `${weeks} sem ${days} día${days !== 1 ? 's' : ''}`;
}

// ── Cálculo LCC → EG en días (Hadlock 1992) ───────────────────────────────
function lccToEgDays(lcc_mm: number): number {
  return LCC_A * Math.sqrt(lcc_mm) + LCC_B;
}

// ── Cálculo DBP → EG en semanas (Hadlock 1984) ────────────────────────────
function dbpToEgWeeks(dbp_mm: number): number {
  const dbp_cm = dbp_mm / 10;
  return DBP_C0 + DBP_C1 * dbp_cm + DBP_C2 * dbp_cm * dbp_cm;
}

// ── Función principal ─────────────────────────────────────────────────────
export function compute(i: Inputs): Outputs {
  const method = (i.method || 'lcc').toLowerCase();
  const measurement = Number(i.measurement_mm) || 0;
  const useFum = (i.use_fum || 'no') === 'yes';
  const fumRaw = (i.fum_date || '').trim();

  const emptyResult: Outputs = {
    gest_age_label: '—',
    fpp_eco: '—',
    fpp_fum: '—',
    discrepancy: '—',
    recommendation: 'Ingresa una medición válida para calcular.',
  };

  // Validación básica
  if (measurement <= 0) return emptyResult;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── Calcular EG ecográfica ─────────────────────────────────────────────
  let egEcoDays: number;
  let trimesterLabel = '';
  let discThreshold = THRESHOLD_1ST;
  let outOfRange = false;

  if (method === 'lcc') {
    if (measurement < LCC_MIN_MM || measurement > LCC_MAX_MM) {
      outOfRange = true;
    }
    egEcoDays = Math.round(lccToEgDays(measurement));
    trimesterLabel = '1.er trimestre (LCC)';
    discThreshold = THRESHOLD_1ST;
  } else {
    // DBP
    if (measurement < DBP_MIN_MM || measurement > DBP_MAX_MM) {
      outOfRange = true;
    }
    const egWeeks = dbpToEgWeeks(measurement);
    egEcoDays = Math.round(egWeeks * 7);
    // Determinar trimestre para umbral
    if (egWeeks < 27) {
      trimesterLabel = '2.º trimestre (DBP)';
      discThreshold = THRESHOLD_2ND;
    } else {
      trimesterLabel = '3.er trimestre (DBP)';
      discThreshold = THRESHOLD_3RD;
    }
  }

  if (egEcoDays <= 0) return emptyResult;

  // Aviso fuera de rango
  const rangeWarning = outOfRange
    ? ` ⚠️ Medición fuera del rango validado para ${method.toUpperCase()} — interpretar con precaución.`
    : '';

  const gestAgeLabel = egDaysToLabel(egEcoDays) + (outOfRange ? ' ⚠️' : '');

  // FPP por ecografía
  const remainingDays = FULL_GESTATION_DAYS - egEcoDays;
  const fppEcoDate = addDays(today, remainingDays);
  const fppEcoStr = formatDate(fppEcoDate);

  // ── FUM ───────────────────────────────────────────────────────────────
  let fppFumStr = '—';
  let discrepancyStr = '—';
  let recommendation = '';

  if (useFum && fumRaw) {
    const fumDate = new Date(fumRaw);
    fumDate.setHours(0, 0, 0, 0);

    // Validar que FUM no sea futura ni hace más de 300 días
    const fumDaysAgo = daysBetween(fumDate, today);
    if (isNaN(fumDate.getTime()) || fumDaysAgo < 0 || fumDaysAgo > 300) {
      recommendation = 'La FUM ingresada no es válida. Verifica la fecha.'
        + rangeWarning;
      return {
        gest_age_label: gestAgeLabel,
        fpp_eco: fppEcoStr,
        fpp_fum: '—',
        discrepancy: '—',
        recommendation,
      };
    }

    // FPP por Naegele
    const fppFumDate = addDays(fumDate, FULL_GESTATION_DAYS);
    fppFumStr = formatDate(fppFumDate);

    // EG por FUM en días
    const egFumDays = fumDaysAgo;

    // Discrepancia absoluta
    const diffDays = Math.abs(egEcoDays - egFumDays);
    const diffSign = egEcoDays > egFumDays ? 'más avanzada' : 'menos avanzada';

    if (diffDays === 0) {
      discrepancyStr = 'Sin discrepancia (0 días)';
    } else {
      discrepancyStr = `${diffDays} día${diffDays !== 1 ? 's' : ''} (ecografía ${diffSign} que FUM)`;
    }

    // Recomendación según umbral
    if (diffDays > discThreshold) {
      recommendation =
        `⚠️ Discrepancia de ${diffDays} días supera el umbral de ${discThreshold} días para ${trimesterLabel}. `
        + `Se recomienda corregir la FPP usando la ecografía: ${fppEcoStr}.`
        + rangeWarning;
    } else {
      recommendation =
        `✅ Discrepancia de ${diffDays} días está dentro del umbral (≤${discThreshold} días) para ${trimesterLabel}. `
        + `Se mantiene la FPP por FUM: ${fppFumStr}.`
        + rangeWarning;
    }
  } else {
    // Sin FUM
    recommendation =
      `FPP estimada por ecografía: ${fppEcoStr}. No se proporcionó FUM para comparar.`
      + rangeWarning;
  }

  return {
    gest_age_label: gestAgeLabel,
    fpp_eco: fppEcoStr,
    fpp_fum: fppFumStr,
    discrepancy: discrepancyStr,
    recommendation,
  };
}
