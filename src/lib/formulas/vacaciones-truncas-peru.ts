/** Vacaciones truncas Perú — 1 sueldo por año proporcional al tiempo trabajado. */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldoMensual: number;
  mesesTrabajados: number;   // meses completos del año vacacional (0-12)
  dias?: number;             // días adicionales sueltos (0-30)
  tieneHijos?: string;       // 'si' suma asignación familiar a la base
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const meses = Math.max(0, Math.min(12, Number(i.mesesTrabajados) || 0));
  const dias = Math.max(0, Math.min(30, Number(i.dias) || 0));
  const conHijos = String(i.tieneHijos || 'no') === 'si';
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');

  const asig = conHijos ? PERU_2026.asignacionFamiliar : 0;
  const remComputable = sueldo + asig;

  // Vacaciones truncas = remuneración × meses/12 + remuneración × días/360.
  const porMeses = (remComputable / 12) * meses;
  const porDias = (remComputable / 360) * dias;
  const vacaciones = porMeses + porDias;

  const _insight = {
    title: 'Tus vacaciones truncas',
    text: `Por **${meses} ${meses === 1 ? 'mes' : 'meses'}${dias ? ` y ${dias} días` : ''}** trabajados con una remuneración computable de **${fmtPEN(remComputable)}**, te corresponde una vacación trunca de **${fmtPEN(vacaciones)}**. Un año completo equivale a un sueldo (30 días de descanso pagado).`,
    tone: 'good',
    icon: '🏖️',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Por meses', value: Math.round(porMeses) },
      { label: 'Por días', value: Math.round(porDias) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(vacaciones),
    centerLabel: 'Vacaciones truncas',
    ariaLabel: `Vacaciones truncas de ${fmtPEN(vacaciones)} por ${meses} meses y ${dias} días trabajados.`,
  };

  return {
    vacaciones: fmtPEN(vacaciones),
    remComputable: fmtPEN(remComputable),
    detalle: `Remuneración ${fmtPEN(remComputable)} · ${meses} meses${dias ? ` + ${dias} días` : ''} = ${fmtPEN(vacaciones)}.`,
    _insight,
    _chart,
  };
}
