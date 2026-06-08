/** Liquidación de beneficios sociales Perú — al cese: CTS trunca + gratificación trunca + vacaciones truncas. */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldo: number;                 // sueldo mensual
  mesesUltimoSemestre: number;    // meses trabajados en el semestre en curso (0-6)
  diasVacacionesPendientes?: number; // días de vacaciones no gozadas (record vacacional trunco, en días)
  tieneHijos?: string;            // 'si' suma asignación familiar a la base
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldo) || 0;
  const meses = Math.max(0, Math.min(6, Number(i.mesesUltimoSemestre) || 0));
  const diasVac = Math.max(0, Number(i.diasVacacionesPendientes) || 0);
  const conHijos = String(i.tieneHijos || 'no') === 'si';
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');

  const asig = conHijos ? PERU_2026.asignacionFamiliar : 0;
  const remComputable = sueldo + asig;

  // CTS trunca: incluye 1/6 de gratificación en la base, proporcional a los meses del semestre.
  const baseCts = remComputable + remComputable / 6;
  const ctsTrunca = (baseCts / 12) * meses;

  // Gratificación trunca: rem. computable × meses/6 + 9% bonificación extraordinaria (Ley 30334).
  const gratTrunca = remComputable * (meses / 6);
  const bonifGrati = gratTrunca * PERU_2026.gratificacion.bonificacionExtraordinaria;
  const gratificacionTrunca = gratTrunca + bonifGrati;

  // Vacaciones truncas: 1 sueldo por año = remuneración / 360 × días pendientes.
  const vacacionesTruncas = (remComputable / 360) * diasVac;

  const total = ctsTrunca + gratificacionTrunca + vacacionesTruncas;

  const _insight = {
    title: 'Tu liquidación al cese',
    text: `Con un sueldo de **${fmtPEN(sueldo)}**${conHijos ? ' + asignación familiar' : ''}, al terminar tu vínculo te corresponde: **CTS trunca ${fmtPEN(ctsTrunca)}** + **gratificación trunca ${fmtPEN(gratificacionTrunca)}** (incluye 9% extra) + **vacaciones truncas ${fmtPEN(vacacionesTruncas)}**. Total de la liquidación: **${fmtPEN(total)}**.`,
    tone: 'good',
    icon: '📋',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'CTS trunca', value: Math.round(ctsTrunca) },
      { label: 'Gratificación trunca', value: Math.round(gratificacionTrunca) },
      { label: 'Vacaciones truncas', value: Math.round(vacacionesTruncas) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(total),
    centerLabel: 'Liquidación total',
    ariaLabel: `Liquidación total de ${fmtPEN(total)}: CTS trunca ${fmtPEN(ctsTrunca)}, gratificación trunca ${fmtPEN(gratificacionTrunca)} y vacaciones truncas ${fmtPEN(vacacionesTruncas)}.`,
  };

  return {
    total: fmtPEN(total),
    ctsTrunca: fmtPEN(ctsTrunca),
    gratificacionTrunca: fmtPEN(gratificacionTrunca),
    vacacionesTruncas: fmtPEN(vacacionesTruncas),
    detalle: `CTS ${fmtPEN(ctsTrunca)} + grati ${fmtPEN(gratificacionTrunca)} + vacaciones ${fmtPEN(vacacionesTruncas)} = ${fmtPEN(total)}.`,
    _insight,
    _chart,
  };
}
