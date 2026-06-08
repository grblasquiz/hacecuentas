/**
 * Datos fiscales y laborales de ECUADOR 2026 — tabla maestra única.
 * Fuentes: SRI, IESS, Ministerio del Trabajo. Verificado 2026-06-08.
 * - SBU 2026: USD 482 (Ministerio del Trabajo).
 * - Tabla IR 2026: Resolución SRI NAC-DGERCGC25-00000043.
 * Ecuador está dolarizado → moneda USD ("$").
 */

export const ECUADOR_2026 = {
  anio: 2026,
  sbu: 482,                  // Salario Básico Unificado (USD)
  iessPersonal: 0.0945,      // aporte personal IESS (relación de dependencia privada)
  iessPatronal: 0.1115,      // aporte patronal IESS (privado)
  iva: 0.15,                 // IVA general (15% desde 2024)
  fondosReserva: 0.0833,     // 8,33% (desde el 2º año con el mismo empleador)
  utilidades: 0.15,          // 15% de utilidades a repartir entre trabajadores
  decimoCuarto: 482,         // 1 SBU (igual al SBU del año)
  irFraccionBasicaDesgravada: 12208, // fracción exenta anual (USD)
  rebajaGastosPersonales: 0.18,      // rebaja del 18% sobre gastos personales (tope por canasta)
  // Tabla IR 2026 personas naturales (Resol. NAC-DGERCGC25-00000043)
  irTabla: [
    { desde: 0,      hasta: 12208,    base: 0,     pct: 0.00 },
    { desde: 12208,  hasta: 15549,    base: 0,     pct: 0.05 },
    { desde: 15549,  hasta: 20188,    base: 167,   pct: 0.10 },
    { desde: 20188,  hasta: 26700,    base: 631,   pct: 0.12 },
    { desde: 26700,  hasta: 35136,    base: 1412,  pct: 0.15 },
    { desde: 35136,  hasta: 46575,    base: 2678,  pct: 0.20 },
    { desde: 46575,  hasta: 62005,    base: 4965,  pct: 0.25 },
    { desde: 62005,  hasta: 82679,    base: 8823,  pct: 0.30 },
    { desde: 82679,  hasta: 109956,   base: 15025, pct: 0.35 },
    { desde: 109956, hasta: Infinity, base: 24572, pct: 0.37 },
  ],
  moneda: 'USD',
  simbolo: '$',
} as const;

/** Impuesto a la renta anual (Ecuador) a partir de la base imponible anual (ingresos − aportes − rebajas).
 *  Devuelve el impuesto causado en USD. */
export function impuestoRentaEC(baseImponibleAnual: number): number {
  const b = Math.max(0, baseImponibleAnual);
  for (const t of ECUADOR_2026.irTabla) {
    if (b > t.desde && b <= t.hasta) return t.base + (b - t.desde) * t.pct;
  }
  const ult = ECUADOR_2026.irTabla[ECUADOR_2026.irTabla.length - 1];
  return ult.base + (b - ult.desde) * ult.pct;
}

/** Formatea un monto en dólares (Ecuador, es-EC). */
export function fmtUSDec(n: number): string {
  return '$' + new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);
}
