/**
 * Social Security COLA 2026 — aplica el ajuste por costo de vida del 2,8% (anunciado
 * por la SSA el 24-oct-2025) al beneficio mensual actual. Calcula el nuevo monto y el
 * aumento mensual y anual. Toma la tasa de src/lib/data/usa-2026.ts (SOCIAL_SECURITY_2026).
 */
import { SOCIAL_SECURITY_2026, fmtUSD, fmtUSD0 } from '../data/usa-2026.ts';

export interface Inputs {
  current_monthly_benefit: number;  // beneficio mensual 2025 (antes del COLA)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const current = Math.max(0, Number(i.current_monthly_benefit) || 0);
  if (current <= 0) throw new Error('Enter your current monthly Social Security benefit');

  const cola = SOCIAL_SECURITY_2026.cola; // 0.028
  // La SSA redondea el beneficio mensual hacia abajo al dólar entero.
  const newMonthlyRaw = current * (1 + cola);
  const newMonthly = Math.floor(newMonthlyRaw);
  const monthlyIncrease = Math.round((newMonthly - current) * 100) / 100;
  const newAnnual = Math.round(newMonthly * 12 * 100) / 100;
  const annualIncrease = Math.round(monthlyIncrease * 12 * 100) / 100;

  const _insight = {
    title: 'Your 2026 benefit after the 2.8% COLA',
    text: `The 2026 cost-of-living adjustment is **2.8%**. A **${fmtUSD(current)}/month** benefit rises to **${fmtUSD(newMonthly)}/month** — about **${fmtUSD(monthlyIncrease)} more each month**, or **${fmtUSD0(annualIncrease)} more per year**. The higher amount starts with your January 2026 payment. Note that a rising Medicare Part B premium (${fmtUSD(202.90)} in 2026) is deducted from many benefits and can offset part of the raise.`,
    tone: 'good',
    icon: '📈',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Current benefit', value: Math.round(current) },
      { label: '2026 COLA raise', value: Math.max(0, Math.round(monthlyIncrease)) },
    ],
    prefix: '$',
    centerValue: fmtUSD0(newMonthly),
    centerLabel: '2026 /mo',
    ariaLabel: `Monthly benefit rises from ${fmtUSD(current)} to ${fmtUSD(newMonthly)} after the 2.8% COLA.`,
  };

  return {
    new_monthly: fmtUSD(newMonthly),
    monthly_increase: fmtUSD(monthlyIncrease),
    new_annual: fmtUSD0(newAnnual),
    annual_increase: fmtUSD0(annualIncrease),
    cola_rate: '2.8%',
    breakdown: `${fmtUSD(current)} × 1.028 = ${fmtUSD(newMonthlyRaw)}, rounded down to ${fmtUSD(newMonthly)}/month. Increase ${fmtUSD(monthlyIncrease)}/month (${fmtUSD0(annualIncrease)}/year).`,
    _insight,
    _chart,
  };
}
