/** Aporte al IESS (Ecuador) — personal 9,45% (descuento) y patronal 11,15% (lo paga la empresa). */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  sueldoMensual: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');

  const aportePersonal = sueldo * ECUADOR_2026.iessPersonal;   // 9,45% — descuento al trabajador
  const aportePatronal = sueldo * ECUADOR_2026.iessPatronal;   // 11,15% — lo paga la empresa
  const aporteTotal = aportePersonal + aportePatronal;
  const sueldoNeto = sueldo - aportePersonal;

  const _insight = {
    title: 'Tu aporte al IESS',
    text: `Sobre un sueldo de **${fmtUSDec(sueldo)}**, a vos te descuentan **${fmtUSDec(aportePersonal)}** (9,45%) y tu empleador aporta **${fmtUSDec(aportePatronal)}** (11,15%). El IESS recibe **${fmtUSDec(aporteTotal)}** en total cada mes por tu afiliación.`,
    tone: 'neutral',
    icon: '🏥',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Aporte personal (9,45%)', value: Math.round(aportePersonal * 100) / 100 },
      { label: 'Aporte patronal (11,15%)', value: Math.round(aportePatronal * 100) / 100 },
    ],
    ariaLabel: `Aporte personal ${fmtUSDec(aportePersonal)} y patronal ${fmtUSDec(aportePatronal)}.`,
  };

  return {
    aportePersonal: fmtUSDec(aportePersonal),
    aportePatronal: fmtUSDec(aportePatronal),
    aporteTotal: fmtUSDec(aporteTotal),
    sueldoNeto: fmtUSDec(sueldoNeto),
    detalle: `Personal 9,45% = ${fmtUSDec(aportePersonal)} · Patronal 11,15% = ${fmtUSDec(aportePatronal)} · Total IESS = ${fmtUSDec(aporteTotal)}.`,
    _insight,
    _chart,
  };
}
