/** Vacaciones Perú (D.Leg. 713) — 30 días, pago vacacional e indemnización por vacaciones no gozadas ("triple"). */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldoMensual: number;   // remuneración computable mensual (S/)
  situacion?: string;      // 'por_gozar' | 'no_gozadas'
  esDirectivo?: string;    // 'si' = gerente / personal de dirección (excluido de la indemnización)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const situacion = String(i.situacion || 'por_gozar');
  const directivo = String(i.esDirectivo || 'no') === 'si';
  if (sueldo <= 0) throw new Error('Ingresá tu remuneración mensual');

  // D.Leg. 713: 30 días calendario de descanso por cada año completo de servicios.
  const dias = 30;

  // Remuneración vacacional (el "récord"): equivale a una remuneración mensual,
  // que se paga antes del inicio del descanso.
  const remuneracionVacacional = sueldo;

  // Vacaciones NO gozadas dentro del año siguiente al que se generó el derecho
  // (Art. 23 D.Leg. 713): el trabajador percibe una indemnización = 1 remuneración,
  // NO afecta a aportes. Excluidos los gerentes / personal de dirección que deciden
  // libremente la oportunidad de su descanso.
  const noGozadas = situacion === 'no_gozadas';
  const indemnizacion = noGozadas && !directivo ? sueldo : 0;

  // "Triple" = 3 remuneraciones cuando no se gozó el descanso:
  //  (1) la del mes trabajado sin descansar (ya percibida como sueldo),
  //  (2) la remuneración vacacional (el récord),
  //  (3) la indemnización.
  const aplicaTriple = noGozadas && !directivo;
  const totalTriple = aplicaTriple ? sueldo * 3 : remuneracionVacacional;
  // Lo que te deben ADEMÁS del sueldo del mes trabajado.
  const adeudadoExtra = remuneracionVacacional + indemnizacion;

  let _insight: any;
  if (aplicaTriple) {
    _insight = {
      title: 'Te corresponde el pago triple',
      text: `No gozaste tus vacaciones en el plazo legal y no sos personal de dirección, así que te corresponde el **pago triple**: **${fmtPEN(totalTriple)}** (3 remuneraciones de ${fmtPEN(sueldo)}). Además del sueldo del mes trabajado, tu empleador te adeuda **${fmtPEN(adeudadoExtra)}**: la remuneración vacacional (${fmtPEN(remuneracionVacacional)}) más la indemnización (${fmtPEN(indemnizacion)}), esta última libre de aportes.`,
      tone: 'warn',
      icon: '🏖️',
    };
  } else if (noGozadas && directivo) {
    _insight = {
      title: 'Sin indemnización por ser personal de dirección',
      text: `Como personal de dirección/gerente que decide su propio descanso, **no** te corresponde la indemnización por vacaciones no gozadas. Cobrás la remuneración vacacional de **${fmtPEN(remuneracionVacacional)}**, pero no el tercer sueldo.`,
      tone: 'neutral',
      icon: '🏖️',
    };
  } else {
    _insight = {
      title: 'Vacaciones por gozar',
      text: `Por tus **30 días** de descanso cobrás la remuneración vacacional de **${fmtPEN(remuneracionVacacional)}**, que se paga antes de salir de vacaciones. Si por algún motivo no llegás a gozarlas en el plazo legal y no sos personal de dirección, se activaría el pago triple.`,
      tone: 'good',
      icon: '🏖️',
    };
  }

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Sueldo mes trabajado', value: Math.round(aplicaTriple ? sueldo : 0) },
      { label: 'Remuneración vacacional', value: Math.round(remuneracionVacacional) },
      { label: 'Indemnización', value: Math.round(indemnizacion) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(aplicaTriple ? totalTriple : remuneracionVacacional),
    centerLabel: aplicaTriple ? 'Pago triple' : 'Pago vacacional',
    ariaLabel: `Vacaciones: ${aplicaTriple ? 'pago triple de ' + fmtPEN(totalTriple) : 'remuneración vacacional de ' + fmtPEN(remuneracionVacacional)}.`,
  };

  return {
    diasVacaciones: `${dias} días calendario`,
    remuneracionVacacional: fmtPEN(remuneracionVacacional),
    indemnizacion: fmtPEN(indemnizacion),
    totalTriple: aplicaTriple ? fmtPEN(totalTriple) : 'No aplica',
    adeudadoExtra: fmtPEN(adeudadoExtra),
    detalle: aplicaTriple
      ? `Pago triple = 3 × ${fmtPEN(sueldo)} = ${fmtPEN(totalTriple)}. Además del sueldo trabajado te adeudan ${fmtPEN(adeudadoExtra)} (récord ${fmtPEN(remuneracionVacacional)} + indemnización ${fmtPEN(indemnizacion)}).`
      : `Remuneración vacacional por 30 días = ${fmtPEN(remuneracionVacacional)}${directivo && noGozadas ? ' (sin indemnización por ser personal de dirección)' : ''}.`,
    _insight,
    _chart,
  };
}
