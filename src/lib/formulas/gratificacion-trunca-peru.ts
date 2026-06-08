/** Gratificación trunca Perú — proporcional al cese: sueldo × meses/6 + 9% bonificación. */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldo: number;
  mesesTrabajados: number; // meses computables del semestre (0-6)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldo) || 0;
  const meses = Math.max(0, Math.min(6, Number(i.mesesTrabajados) || 0));
  if (sueldo <= 0) throw new Error('Ingresá tu remuneración mensual');

  // Gratificación trunca = (sueldo) × meses computables / 6.
  const gratiBase = sueldo * (meses / 6);

  // Bonificación extraordinaria del 9% (Ley 30334), lo que iría a EsSalud.
  const bonificacion = gratiBase * PERU_2026.gratificacion.bonificacionExtraordinaria;
  const total = gratiBase + bonificacion;

  const _insight = {
    title: 'Tu gratificación trunca',
    text: `Por **${meses} mes(es)** computable(s) en el semestre con un sueldo de **${fmtPEN(sueldo)}** te corresponde una gratificación trunca de **${fmtPEN(gratiBase)}** más la bonificación extraordinaria del **9%** (${fmtPEN(bonificacion)}): total **${fmtPEN(total)}**. La gratificación es libre de AFP/ONP. Si cesaste, se paga junto a tu liquidación de beneficios sociales.`,
    tone: 'good',
    icon: '🎁',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Gratificación', value: Math.round(gratiBase) },
      { label: 'Bonificación 9%', value: Math.round(bonificacion) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(total),
    centerLabel: 'Total a cobrar',
    ariaLabel: `Gratificación trunca: ${fmtPEN(total)} por ${meses} meses computables.`,
  };

  return {
    total: fmtPEN(total),
    gratificacion: fmtPEN(gratiBase),
    bonificacion: fmtPEN(bonificacion),
    detalle: `${fmtPEN(sueldo)} × ${meses}/6 = ${fmtPEN(gratiBase)} + 9% bonificación (${fmtPEN(bonificacion)}) = ${fmtPEN(total)}.`,
    _insight,
    _chart,
  };
}
