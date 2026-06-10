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
