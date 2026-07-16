/**
 * Fuente única de límites de retiro IRS — Estados Unidos, tax year 2026.
 *
 * Antes cada fórmula EN hardcodeaba estos valores; centralizarlos acá evita
 * drift entre calcs y facilita el ajuste anual (un solo archivo).
 *
 * dataAsOf: 2026-06-09. El IRS publica los límites del año siguiente cada
 * noviembre (cost-of-living adjustments) — reverificar cada noviembre.
 *
 * Fuente: IRS Notice 2025-67 (Nov 2025) — 2026 cost-of-living adjustments:
 *   https://www.irs.gov/pub/irs-drop/n-25-67.pdf
 *   - 401(k)/403(b)/457 elective deferral §402(g): $24,500
 *   - Catch-up 50+ §414(v)(2)(B)(i): $8,000
 *   - Super catch-up 60–63 (SECURE 2.0 §109): $11,250
 *   - §415(c) total annual additions (employee + employer): $72,000
 *   - §401(a)(17) compensation cap: $360,000
 *   - IRA §219(b)(5)(A): $7,500; catch-up 50+ §219(b)(5)(B): $1,100
 */

/** Vigencia del dato (YYYY-MM-DD) — usada por el sello de frescura a nivel dato (src/lib/data-freshness.ts). */
export const DATA_AS_OF = '2026-06-09';

/** 401(k)/403(b)/457(b) — límites 2026 (IRS Notice 2025-67). */
export const IRS_401K = {
  /** Elective deferral, under 50 (§402(g)). */
  deferralUnder50: 24500,
  /** Catch-up adicional para 50+ (§414(v)(2)(B)(i)). */
  catchUp50: 8000,
  /** Super catch-up para edades 60–63 (SECURE 2.0 §109; reemplaza al catch-up estándar). */
  superCatchUp60_63: 11250,
  /** Tope total de aportes empleado + empleador (§415(c)). */
  total415c: 72000,
  /** Tope de compensación computable (§401(a)(17)). */
  compCap: 360000,
} as const;

/** IRA (Traditional y Roth) — límites 2026 (IRS Notice 2025-67). */
export const IRA_2026 = {
  /** Límite de aporte anual, under 50 (§219(b)(5)(A)). */
  limit: 7500,
  /** Catch-up adicional para 50+ (§219(b)(5)(B), indexado por SECURE 2.0). */
  catchUp50: 1100,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Federal income tax — tax year 2026.
// Fuente: IRS Rev. Proc. 2025-32 (oct-2025) + One Big Beautiful Bill Act.
//   https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill
//   Tabla cruzada con Tax Foundation "2026 Tax Brackets". Verificado 2026-07-16.
// Antes cada fórmula EN hardcodeaba tramos/deducciones 2025 stale (ej.: SS wage
// base 176100, standard deduction sin OBBBA). Centralizado acá = una sola fuente.
// ─────────────────────────────────────────────────────────────────────────────

export type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh';

/**
 * Tramos federales 2026 como pares ascendentes [límiteInferior, tasa].
 * Cada tramo aplica su tasa al excedente entre su límite inferior y el del
 * tramo siguiente (marginal progresivo).
 */
export const FEDERAL_BRACKETS_2026: Record<FilingStatus, [number, number][]> = {
  single: [[0, 0.10], [12400, 0.12], [50400, 0.22], [105700, 0.24], [201775, 0.32], [256225, 0.35], [640600, 0.37]],
  mfj:    [[0, 0.10], [24800, 0.12], [100800, 0.22], [211400, 0.24], [403550, 0.32], [512450, 0.35], [768700, 0.37]],
  mfs:    [[0, 0.10], [12400, 0.12], [50400, 0.22], [105700, 0.24], [201775, 0.32], [256225, 0.35], [384350, 0.37]],
  hoh:    [[0, 0.10], [17700, 0.12], [67450, 0.22], [105700, 0.24], [201775, 0.32], [256200, 0.35], [640600, 0.37]],
};

/** Standard deduction 2026 (IRS Rev. Proc. 2025-32). */
export const STANDARD_DEDUCTION_2026: Record<FilingStatus, number> = {
  single: 16100, mfj: 32200, mfs: 16100, hoh: 24150,
};

/** Impuesto federal a la renta 2026 sobre el ingreso gravable (taxable income). */
export function calcFederalTax(taxableIncome: number, status: FilingStatus = 'single'): number {
  const ti = Math.max(0, Number(taxableIncome) || 0);
  if (ti <= 0) return 0;
  const brackets = FEDERAL_BRACKETS_2026[status] ?? FEDERAL_BRACKETS_2026.single;
  let tax = 0;
  for (let b = 0; b < brackets.length; b++) {
    const lower = brackets[b][0];
    const rate = brackets[b][1];
    const upper = b + 1 < brackets.length ? brackets[b + 1][0] : Infinity;
    if (ti <= lower) break;
    tax += (Math.min(ti, upper) - lower) * rate;
  }
  return Math.round(tax * 100) / 100;
}

/** Tasa marginal (tramo más alto alcanzado) para un ingreso gravable dado. */
export function marginalRate2026(taxableIncome: number, status: FilingStatus = 'single'): number {
  const ti = Math.max(0, Number(taxableIncome) || 0);
  const brackets = FEDERAL_BRACKETS_2026[status] ?? FEDERAL_BRACKETS_2026.single;
  let rate = brackets[0][1];
  for (const [lower, r] of brackets) if (ti > lower) rate = r;
  return rate;
}

// ── FICA / payroll 2026 ──
// SS wage base: SSA press release 2025-10-24 → $184,500 (2025: $176,100).
export const FICA_2026 = {
  ssRate: 0.062,                 // Social Security, empleado (IRC §3101(a))
  ssRateSelfEmployed: 0.124,     // ambas mitades para autónomos (Schedule SE)
  ssWageBase: 184500,            // tope de ingresos sujetos a Social Security
  medicareRate: 0.0145,          // Medicare, empleado (sin tope)
  medicareRateSelfEmployed: 0.029,
  addlMedicareRate: 0.009,       // Additional Medicare Tax (IRC §3101(b)(2))
  seNetEarningsFactor: 0.9235,   // Schedule SE: net profit × 92,35%
  addlMedicareThreshold: { single: 200000, mfj: 250000, mfs: 125000, hoh: 200000 } as Record<FilingStatus, number>,
} as const;

// ── Long-term capital gains 2026 (IRS Rev. Proc. 2025-32) ──
// 0% hasta zeroMax; 15% de zeroMax a fifteenMax; 20% por encima (sobre taxable income apilado).
export const CAPITAL_GAINS_2026: Record<FilingStatus, { zeroMax: number; fifteenMax: number }> = {
  single: { zeroMax: 49450, fifteenMax: 545500 },
  mfj:    { zeroMax: 98900, fifteenMax: 613700 },
  mfs:    { zeroMax: 49450, fifteenMax: 306850 },
  hoh:    { zeroMax: 66200, fifteenMax: 579600 },
};

/** Net Investment Income Tax (NIIT) 3,8% — umbral de MAGI (IRC §1411). */
export const NIIT_2026 = {
  rate: 0.038,
  threshold: { single: 200000, mfj: 250000, mfs: 125000, hoh: 200000 } as Record<FilingStatus, number>,
} as const;

// ── Child Tax Credit 2026 (One Big Beautiful Bill Act, jul-2025) ──
// CTC $2,200/hijo; porción reembolsable (ACTC) $1,700; verificado IRS TY2026 2026-07-16.
export const CHILD_TAX_CREDIT_2026 = {
  perChild: 2200,
  refundableCap: 1700,           // Additional Child Tax Credit máximo reembolsable por hijo
  otherDependent: 500,           // crédito por otros dependientes (no reembolsable)
  phaseoutStart: { single: 200000, mfj: 400000, mfs: 200000, hoh: 200000 } as Record<FilingStatus, number>,
  phaseoutPer1000: 50,           // reducción de $50 por cada $1.000 (o fracción) sobre el umbral
} as const;

// ── Social Security retirement 2026 ──
// Bend points de elegibilidad 2026: $1,286 / $7,749. COLA 2026: 2,8% (SSA 2025-10-24).
export const SOCIAL_SECURITY_2026 = {
  cola: 0.028,
  bendPoint1: 1286,
  bendPoint2: 7749,
  piaFactors: [0.90, 0.32, 0.15] as [number, number, number],
  fullRetirementAge: 67,         // nacidos en 1960 o después
  earlyClaimAge: 62,
  maxDelayAge: 70,
  delayedCreditPerYear: 0.08,    // 8%/año hasta los 70 (nacidos 1943+)
  maxTaxableEarnings: 184500,
  earningsTestUnderFRA: 24480,   // límite anual de ingresos bajo FRA (2026)
  earningsTestYearOfFRA: 65160,  // límite en el año en que se cumple la FRA (2026)
} as const;

// ── RMD — Required Minimum Distributions (SECURE 2.0 Act) ──
/** Edad de inicio obligatorio (required beginning age) según año de nacimiento. */
export function rmdRequiredBeginningAge(birthYear: number): number {
  if (birthYear >= 1960) return 75;   // SECURE 2.0 §107 (vigente 2033+)
  if (birthYear >= 1951) return 73;   // vigente desde 2023
  return 72;                          // nacidos en 1950 o antes (RMD ya iniciado a los 72)
}

/** IRS Uniform Lifetime Table (Table III, Pub. 590-B, vigente 2022+). Edad → período de distribución. */
export const RMD_UNIFORM_LIFETIME: Record<number, number> = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1,
  80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4,
  88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9,
  96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2,
  104: 4.9, 105: 4.6, 106: 4.3, 107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4,
  112: 3.3, 113: 3.1, 114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7, 118: 2.5, 119: 2.3, 120: 2.0,
};

/** Formatea un monto en USD con dos decimales. */
export function fmtUSD(n: number): string {
  const v = Math.round((Number(n) || 0) * 100) / 100;
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Formatea un monto en USD redondeado al dólar entero. */
export function fmtUSD0(n: number): string {
  return '$' + Math.round(Number(n) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
}
