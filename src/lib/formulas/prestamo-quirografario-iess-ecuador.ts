/** Préstamo quirografario del IESS (Ecuador) — monto máximo y cuota mensual (amortización francesa).
 *  Monto máximo referencial ≈ 80 × sueldo, con tope. Tasa anual referencial ~11,35%.
 *  Valores orientativos: el monto y la tasa vigentes los define el IESS/Biess. */
import { fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  sueldoMensual: number;
  montoSolicitado: number;
  plazoMeses: number;
  tasaAnual?: number; // default 0.1135
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const TOPE_MONTO = 50000; // tope referencial del préstamo quirografario

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const solicitado = Math.max(0, Number(i.montoSolicitado) || 0);
  const plazo = Math.max(1, Math.round(Number(i.plazoMeses) || 0));
  // '' → default. Number('') === 0, así que tratamos 0 como "usar default".
  const tasaInput = Number(i.tasaAnual);
  const tasaAnual = Number.isFinite(tasaInput) && tasaInput > 0 ? tasaInput : 0.1135;
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');
  if (solicitado <= 0) throw new Error('Ingresá el monto que querés solicitar');

  const montoMaximo = Math.min(sueldo * 80, TOPE_MONTO);
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
    text: `${excede ? `El máximo estimado para tu sueldo es **${fmtUSDec(montoMaximo)}** (pediste ${fmtUSDec(solicitado)}). ` : ''}Para **${fmtUSDec(aprobado)}** a ${plazo} meses (tasa ${(tasaAnual * 100).toFixed(2)}% anual), la cuota mensual es de **${fmtUSDec(cuota)}** — el ${(cuotaSobreSueldo * 100).toFixed(0)}% de tu sueldo. Pagarías **${fmtUSDec(totalIntereses)}** en intereses. Montos y tasa orientativos: confirmá con el Biess/IESS.`,
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
