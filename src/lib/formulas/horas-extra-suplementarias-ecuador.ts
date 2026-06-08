/** Horas extra (Ecuador) — suplementarias (recargo 50%) y extraordinarias (recargo 100%).
 *  Valor hora = sueldo / 240 (8h × 30 días). */
import { fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  sueldoMensual: number;
  horasSuplementarias?: number;   // hasta 4h/día y 12h/sem, recargo 50%
  horasExtraordinarias?: number;  // noche, sábados, domingos, feriados — recargo 100%
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const supl = Math.max(0, Number(i.horasSuplementarias) || 0);
  const extra = Math.max(0, Number(i.horasExtraordinarias) || 0);
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');

  const valorHora = sueldo / 240; // jornada mensual de referencia: 240 horas
  const pagoSuplementarias = supl * valorHora * 1.5;   // recargo 50%
  const pagoExtraordinarias = extra * valorHora * 2.0; // recargo 100%
  const total = pagoSuplementarias + pagoExtraordinarias;

  const _insight = {
    title: 'Pago por horas extra',
    text: `Tu valor hora normal es **${fmtUSDec(valorHora)}** (sueldo ÷ 240). Las **suplementarias** se pagan con recargo del 50% (${fmtUSDec(valorHora * 1.5)}/h) y las **extraordinarias** (noche, fin de semana o feriado) con recargo del 100% (${fmtUSDec(valorHora * 2)}/h). En total cobrarías **${fmtUSDec(total)}** extra.`,
    tone: 'good',
    icon: '⏱️',
  };
  const _chart = {
    type: 'donut',
    segments: [
      ...(pagoSuplementarias > 0 ? [{ label: 'Suplementarias (+50%)', value: Math.round(pagoSuplementarias * 100) / 100 }] : []),
      ...(pagoExtraordinarias > 0 ? [{ label: 'Extraordinarias (+100%)', value: Math.round(pagoExtraordinarias * 100) / 100 }] : []),
    ],
    label: fmtUSDec(total),
    ariaLabel: `Total horas extra ${fmtUSDec(total)}.`,
  };

  return {
    totalHorasExtra: fmtUSDec(total),
    valorHora: fmtUSDec(valorHora),
    pagoSuplementarias: fmtUSDec(pagoSuplementarias),
    pagoExtraordinarias: fmtUSDec(pagoExtraordinarias),
    detalle: `Valor hora ${fmtUSDec(valorHora)} · ${supl} suplem (+50%) = ${fmtUSDec(pagoSuplementarias)} · ${extra} extraord (+100%) = ${fmtUSDec(pagoExtraordinarias)}.`,
    _insight,
    _chart,
  };
}
