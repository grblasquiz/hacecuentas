export interface Inputs {
  principal: number;
  monthly_contribution: number;
  annual_rate: number;
  years: number;
  compounding_frequency: string;
}

export interface Outputs {
  final_balance: number;
  total_contributed: number;
  total_interest: number;
  interest_ratio: number;
  yearly_breakdown: string;
}

// Mapa de frecuencia de capitalización a períodos por año
const COMPOUNDING_MAP: Record<string, number> = {
  annually: 1,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

/**
 * Calcula el balance de una posición con interés compuesto y aportes mensuales.
 *
 * Fórmula:
 *   A_principal = P × (1 + r/n)^(n×t)
 *   A_aportes   = PMT × [(1 + r/n)^(n×t) − 1] / (r/n) × (1 + r/n)  [pago al inicio]
 *   Balance     = A_principal + A_aportes
 *
 * Fuente: CFA Institute — Time Value of Money (2026)
 */
export function compute(i: Inputs): Outputs {
  const principal = Number(i.principal) || 0;
  const monthly_contribution = Number(i.monthly_contribution) || 0;
  const annual_rate = Number(i.annual_rate) || 0;
  const years = Number(i.years) || 0;
  const freq = i.compounding_frequency || "monthly";

  // Validaciones básicas
  if (years <= 0) {
    return {
      final_balance: principal,
      total_contributed: principal,
      total_interest: 0,
      interest_ratio: 0,
      yearly_breakdown: "Ingresa un plazo mayor a 0 años.",
    };
  }

  if (principal < 0 || monthly_contribution < 0) {
    return {
      final_balance: 0,
      total_contributed: 0,
      total_interest: 0,
      interest_ratio: 0,
      yearly_breakdown: "El capital inicial y el aporte mensual deben ser valores positivos.",
    };
  }

  // Frecuencia de capitalización (períodos por año)
  const n = COMPOUNDING_MAP[freq] ?? 12;

  // Tasa por período de capitalización
  const r = annual_rate / 100;
  const rate_per_period = r / n;

  // -------------------------------------------------------
  // Cálculo del balance final
  // -------------------------------------------------------
  let final_balance: number;
  let total_contributed: number;
  let total_interest: number;

  if (r === 0) {
    // Caso especial: tasa cero
    const total_months = Math.round(years * 12);
    final_balance = principal + monthly_contribution * total_months;
    total_contributed = principal + monthly_contribution * total_months;
    total_interest = 0;
  } else {
    const total_periods = n * years; // períodos totales de capitalización
    const growth_factor = Math.pow(1 + rate_per_period, total_periods);

    // Componente del capital inicial
    const a_principal = principal * growth_factor;

    // Componente de aportes mensuales (pago al inicio del período — annuity-due)
    // Los aportes son mensuales, la capitalización puede ser a otra frecuencia.
    // Convertimos los aportes mensuales a la frecuencia de capitalización equivalente.
    // Tasa mensual efectiva:
    const monthly_rate_eff = Math.pow(1 + rate_per_period, n / 12) - 1;
    const total_months = years * 12;
    const growth_factor_monthly = Math.pow(1 + monthly_rate_eff, total_months);

    // Anualidad futura con pago al inicio (annuity-due)
    const a_aportes =
      monthly_contribution *
      ((growth_factor_monthly - 1) / monthly_rate_eff) *
      (1 + monthly_rate_eff);

    final_balance = a_principal + a_aportes;
    total_contributed = principal + monthly_contribution * Math.round(total_months);
    total_interest = final_balance - total_contributed;
  }

  // Evitar negativos por redondeo
  if (total_interest < 0) total_interest = 0;
  const interest_ratio = final_balance > 0 ? (total_interest / final_balance) * 100 : 0;

  // -------------------------------------------------------
  // Evolución año por año
  // -------------------------------------------------------
  const rows: string[] = [];
  rows.push("Año | Balance | Total aportado | Interés acumulado");
  rows.push("--- | --- | --- | ---");

  for (let y = 1; y <= Math.min(Math.ceil(years), 50); y++) {
    let balance_y: number;
    let contributed_y: number;

    if (r === 0) {
      const months_y = Math.round(y * 12);
      balance_y = principal + monthly_contribution * months_y;
      contributed_y = principal + monthly_contribution * months_y;
    } else {
      const total_periods_y = n * y;
      const growth_factor_y = Math.pow(1 + rate_per_period, total_periods_y);
      const a_principal_y = principal * growth_factor_y;

      const monthly_rate_eff_y = Math.pow(1 + rate_per_period, n / 12) - 1;
      const total_months_y = y * 12;
      const growth_factor_monthly_y = Math.pow(1 + monthly_rate_eff_y, total_months_y);
      const a_aportes_y =
        monthly_contribution *
        ((growth_factor_monthly_y - 1) / monthly_rate_eff_y) *
        (1 + monthly_rate_eff_y);

      balance_y = a_principal_y + a_aportes_y;
      contributed_y = principal + monthly_contribution * Math.round(total_months_y);
    }

    const interest_y = Math.max(0, balance_y - contributed_y);
    rows.push(
      `${y} | USD ${balance_y.toFixed(2)} | USD ${contributed_y.toFixed(2)} | USD ${interest_y.toFixed(2)}`
    );
  }

  const yearly_breakdown = rows.join("\n");

  return {
    final_balance: parseFloat(final_balance.toFixed(2)),
    total_contributed: parseFloat(total_contributed.toFixed(2)),
    total_interest: parseFloat(total_interest.toFixed(2)),
    interest_ratio: parseFloat(interest_ratio.toFixed(2)),
    yearly_breakdown,
  };
}
