/** Gratificación Perú (julio y diciembre) — Ley 27735 y bonificación extraordinaria Ley 30334. */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldoMensual: number;
  mesesTrabajados: number;   // meses completos del semestre (0-6)
  tieneHijos?: string;       // 'si' suma asignación familiar a la base
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const meses = Math.max(0, Math.min(6, Number(i.mesesTrabajados) || 0));
  const conHijos = String(i.tieneHijos || 'no') === 'si';
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');

  const asig = conHijos ? PERU_2026.asignacionFamiliar : 0;
  const remComputable = sueldo + asig;

  // Gratificación = remuneración computable × meses / 6 (1 sueldo por semestre completo)
  const gratificacion = remComputable * (meses / 6);
  // Bonificación extraordinaria 9% (Ley 30334): lo que iría a EsSalud va al trabajador.
  const bonificacion = gratificacion * PERU_2026.gratificacion.bonificacionExtraordinaria;
  const total = gratificacion + bonificacion;

  const _insight = {
    title: 'Tu gratificación',
    text: `Con un sueldo de **${fmtPEN(sueldo)}**${conHijos ? ' + asignación familiar' : ''} y **${meses} ${meses === 1 ? 'mes' : 'meses'}** trabajados, tu gratificación es **${fmtPEN(gratificacion)}** más una **bonificación extraordinaria del 9%** de **${fmtPEN(bonificacion)}** (Ley 30334). Total a cobrar: **${fmtPEN(total)}**. La gratificación no tiene descuentos de AFP ni ONP.`,
    tone: 'good',
    icon: '🎁',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Gratificación', value: Math.round(gratificacion) },
      { label: 'Bonificación 9%', value: Math.round(bonificacion) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(total),
    centerLabel: 'Total a cobrar',
    ariaLabel: `Gratificación de ${fmtPEN(gratificacion)} más bonificación extraordinaria del 9% de ${fmtPEN(bonificacion)}, total ${fmtPEN(total)}.`,
  };

  return {
    total: fmtPEN(total),
    gratificacion: fmtPEN(gratificacion),
    bonificacion: fmtPEN(bonificacion),
    detalle: `Remuneración computable ${fmtPEN(remComputable)} · ${meses}/6 del semestre · + 9% Ley 30334 · sin descuentos.`,
    _insight,
    _chart,
  };
}
