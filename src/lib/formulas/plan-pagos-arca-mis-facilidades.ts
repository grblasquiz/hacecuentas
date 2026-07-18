import { MIS_FACILIDADES_RG5828 as M, fmtARS } from '../data/argentina-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Plan de pagos ARCA "Mis Facilidades" (RG 5828/2026, adhesión hasta 30-oct-2026):
 * pago a cuenta (5% micro/pequeña, 10% mediana), saldo en cuotas fijas por sistema
 * francés a tasa de financiación mensual (2,75% jul-2026). Cuota y anticipo mínimos: $50.000.
 */
export function compute(i: Inputs): Outputs {
  const deuda = Math.max(0, Number(i.deuda) || 0);
  const planKey = String(i.tipoPlan || 'micro') as keyof typeof M.planes;
  const plan = M.planes[planKey] || M.planes.micro;
  const cuotasPedidas = Math.max(1, Math.round(Number(i.cuotas) || 12));
  const cuotas = Math.min(plan.cuotasMax, cuotasPedidas);
  const tasa = Math.min(20, Math.max(0, Number(i.tasaMensual) || M.tasaMensualPct)) / 100;

  const pagoACuenta = deuda * (plan.pagoACuentaPct / 100);
  const financiado = deuda - pagoACuenta;
  const cuota = tasa > 0
    ? financiado * tasa / (1 - Math.pow(1 + tasa, -cuotas))
    : financiado / cuotas;
  const totalCuotas = cuota * cuotas;
  const intereses = totalCuotas - financiado;
  const totalPlan = pagoACuenta + totalCuotas;

  const out: Outputs = {
    pagoACuenta: `${fmtARS(pagoACuenta)} (${plan.pagoACuentaPct}%)`,
    cuotaMensual: fmtARS(cuota),
    interesesFinanciacion: fmtARS(intereses),
    totalDelPlan: fmtARS(totalPlan),
    cuotasDelPlan: `${cuotas} cuotas fijas`,
  };

  const avisos: string[] = [];
  if (cuotasPedidas > plan.cuotasMax) avisos.push(`el plan "${plan.label}" admite hasta **${plan.cuotasMax} cuotas** (ajustamos el cálculo a ese máximo)`);
  if (deuda > 0 && cuota < M.cuotaMinima) avisos.push(`la cuota queda debajo del mínimo de **${fmtARS(M.cuotaMinima)}**: ARCA te va a exigir menos cuotas`);
  if (deuda > 0 && pagoACuenta < M.cuotaMinima) avisos.push(`el pago a cuenta queda debajo del mínimo de **${fmtARS(M.cuotaMinima)}**`);

  out._insight = {
    title: `${cuotas} cuotas de ${fmtARS(cuota)} + ${fmtARS(pagoACuenta)} de anticipo`,
    text:
      `Sobre una deuda de **${fmtARS(deuda)}**, pagás **${fmtARS(pagoACuenta)}** al adherir y financiás **${fmtARS(financiado)}** en ${cuotas} cuotas de **${fmtARS(cuota)}** (tasa ${(tasa * 100).toLocaleString('es-AR', { maximumFractionDigits: 2 })}% mensual, sistema francés). ` +
      `La financiación te cuesta **${fmtARS(intereses)}** de intereses; total del plan: **${fmtARS(totalPlan)}**.` +
      (avisos.length ? ` Ojo: ${avisos.join('; ')}.` : ' Las cuotas se debitan automáticamente de la cuenta bancaria declarada.'),
    tone: avisos.length ? 'warn' : 'neutral',
    icon: '🧾',
  };
  return out;
}
