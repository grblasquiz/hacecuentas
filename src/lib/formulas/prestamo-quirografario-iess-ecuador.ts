/** Préstamo quirografario del IESS (Ecuador) — cuota mensual.
 *  Tarifario BIESS febrero 2026: máximo 80 SBU (USD 38.560) y tasa nominal
 *  escalonada por plazo. El monto aprobado real depende de fondos de reserva,
 *  cesantía y capacidad de pago; no es "80 × sueldo". */
import { fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  sueldoMensual: number;
  montoSolicitado: number;
  plazoMeses: number;
  tasaAnual?: number; // decimal; vacío/0 = tasa oficial según plazo
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const SBU_2026 = 482;
const TOPE_MONTO = 80 * SBU_2026; // USD 38.560 — tarifario BIESS 2026

/** Tasa nominal anual de préstamos nuevos para afiliados, por plazo. */
export function tasaBiessPorPlazo(meses: number): number {
  if (meses <= 6) return 0.065;
  if (meses <= 9) return 0.075;
  if (meses <= 12) return 0.085;
  if (meses <= 48) return 0.11;
  return 0.1299; // 49–60 meses
}

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const solicitado = Math.max(0, Number(i.montoSolicitado) || 0);
  const plazo = Math.min(60, Math.max(1, Math.round(Number(i.plazoMeses) || 0)));
  // '' → default. Number('') === 0, así que tratamos 0 como "usar default".
  const tasaInput = Number(i.tasaAnual);
  const tasaAnual = Number.isFinite(tasaInput) && tasaInput > 0 ? tasaInput : tasaBiessPorPlazo(plazo);
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');
  if (solicitado <= 0) throw new Error('Ingresá el monto que querés solicitar');

  const montoMaximo = TOPE_MONTO;
  const aprobado = Math.min(solicitado, montoMaximo);
  const excede = solicitado > montoMaximo;

  // Amortización francesa: cuota = P × r / (1 − (1+r)^-n)
  const r = tasaAnual / 12;
  const cuota = r > 0
    ? aprobado * r / (1 - Math.pow(1 + r, -plazo))
    : aprobado / plazo;
  const totalPagar = cuota * plazo;
  const totalIntereses = totalPagar - aprobado;
  const cuotaSobreSueldo = sueldo > 0 ? cuota / sueldo : 0;

  const _insight = {
    title: 'Tu préstamo quirografario',
    text: `${excede ? `El tope general 2026 es **${fmtUSDec(montoMaximo)}** (80 SBU); pediste ${fmtUSDec(solicitado)}. ` : ''}Para **${fmtUSDec(aprobado)}** a ${plazo} meses (tasa nominal ${(tasaAnual * 100).toFixed(2)}%), la cuota es **${fmtUSDec(cuota)}** — el ${(cuotaSobreSueldo * 100).toFixed(0)}% de tu sueldo. Pagarías **${fmtUSDec(totalIntereses)}** en intereses. El BIESS puede aprobar menos según tus fondos y capacidad de pago.`,
    tone: cuotaSobreSueldo > 0.4 ? 'warning' : 'neutral',
    icon: '🏦',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Capital', value: Math.round(aprobado * 100) / 100 },
      { label: 'Intereses', value: Math.round(totalIntereses * 100) / 100 },
    ],
    ariaLabel: `Capital ${fmtUSDec(aprobado)} más intereses ${fmtUSDec(totalIntereses)}.`,
  };

  return {
    cuotaMensual: fmtUSDec(cuota),
    montoAprobado: fmtUSDec(aprobado),
    montoMaximo: fmtUSDec(montoMaximo),
    totalPagar: fmtUSDec(totalPagar),
    totalIntereses: fmtUSDec(totalIntereses),
    detalle: `${fmtUSDec(aprobado)} a ${plazo} meses · tasa ${(tasaAnual * 100).toFixed(2)}% anual · cuota ${fmtUSDec(cuota)} (${(cuotaSobreSueldo * 100).toFixed(0)}% del sueldo).`,
    _insight,
    _chart,
  };
}
