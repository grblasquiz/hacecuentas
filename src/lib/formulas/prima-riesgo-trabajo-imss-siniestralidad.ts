/**
 * Prima de riesgo de trabajo IMSS — siniestralidad anual (LSS Art. 72).
 * Prima = [(S/365) + V × (I + D)] × (F/N) + M, con V=28, F=2.3, M=0.005.
 * Acotada a ±1 punto porcentual vs la prima vigente y entre 0.5% y 15% (LSS Art. 74).
 * Declaración anual de siniestralidad: febrero; la prima nueva rige de marzo a febrero.
 * Constantes desde src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  trabajadores: number;          // N: trabajadores promedio expuestos al riesgo
  diasSubsidiados?: number;      // S: días subsidiados por incapacidad temporal en el año
  porcentajesIncapacidad?: number; // I: suma de % de incapacidades permanentes (parciales + totales), en %
  defunciones?: number;          // D: defunciones por riesgo de trabajo
  primaActual?: number;          // prima vigente en %, para acotar la variación a ±1 punto
  sbcPromedioDiario?: number;    // SBC promedio diario por trabajador, para el costo en pesos
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const { primaRiesgoTrabajo: prt } = MEXICO_2026;

  const n = Math.floor(num(i.trabajadores, 0));
  if (n <= 0) throw new Error('Ingresa el número promedio de trabajadores expuestos al riesgo');
  const s = Math.max(0, num(i.diasSubsidiados, 0));
  const iPct = Math.max(0, num(i.porcentajesIncapacidad, 0));
  const d = Math.max(0, Math.floor(num(i.defunciones, 0)));
  const primaActualPct = num(i.primaActual, NaN); // NaN = no la conoce → no se acota ±1pt
  const sbcDiario = Math.max(0, num(i.sbcPromedioDiario, 0));

  // Fórmula LSS Art. 72 (I se expresa en fracción decimal: 25% → 0.25).
  const iDecimal = iPct / 100;
  const siniestralidad = (s / 365 + prt.V * (iDecimal + d)) * (prt.F / n);
  const primaCalculada = siniestralidad + prt.M; // en decimal

  // Acotamientos LSS Art. 74: ±1 punto vs la prima vigente, y entre 0.5% y 15%.
  const tieneActual = Number.isFinite(primaActualPct) && primaActualPct > 0;
  let primaFinal = primaCalculada;
  if (tieneActual) {
    const actual = primaActualPct / 100;
    primaFinal = Math.min(Math.max(primaFinal, actual - prt.variacionMaximaAnual), actual + prt.variacionMaximaAnual);
  }
  primaFinal = Math.min(Math.max(primaFinal, prt.M), prt.primaMaxima);

  const primaCalcPct = primaCalculada * 100;
  const primaFinalPct = primaFinal * 100;
  const seAcoto = Math.abs(primaFinal - primaCalculada) > 0.000005;

  // Costo en pesos: la cuota del seguro de RT es prima × SBC (LSS Art. 71).
  const nominaSbcAnual = sbcDiario > 0 ? sbcDiario * 365 * n : 0;
  const costoAnual = nominaSbcAnual * primaFinal;
  const costoMensual = costoAnual / 12;
  const costoActualAnual = tieneActual && nominaSbcAnual > 0 ? nominaSbcAnual * (primaActualPct / 100) : 0;
  const diferenciaAnual = costoAnual - costoActualAnual;

  const sube = tieneActual && primaFinalPct > primaActualPct + 0.0001;
  const baja = tieneActual && primaFinalPct < primaActualPct - 0.0001;

  const _insight = {
    title: sube ? 'Tu prima sube' : baja ? 'Tu prima baja' : 'Tu prima de riesgo',
    text: `La siniestralidad ${s + iPct + d > 0 ? `(${s} días subsidiados${iPct > 0 ? `, ${iPct}% de incapacidades permanentes` : ''}${d > 0 ? `, ${d} defunción${d > 1 ? 'es' : ''}` : ''})` : 'de cero accidentes'} da una prima calculada de **${primaCalcPct.toFixed(4)}%**${seAcoto ? `, que ${tieneActual ? 'por el límite de ±1 punto anual' : 'por los topes legales (0.5%–15%)'} queda en **${primaFinalPct.toFixed(2)}%**` : ''}.${nominaSbcAnual > 0 ? ` El seguro de riesgos de trabajo te costará **${fmtMXN(costoAnual)} al año** (${fmtMXN(costoMensual)}/mes)${tieneActual ? `, ${diferenciaAnual >= 0 ? `**${fmtMXN(Math.abs(diferenciaAnual))} más**` : `**${fmtMXN(Math.abs(diferenciaAnual))} menos**`} que con tu prima actual` : ''}.` : ''}${baja ? ' Cada año sin siniestros puede bajarla hasta 1 punto más, hasta el mínimo de 0.5%.' : ''}`,
    tone: (sube ? 'warn' : baja ? 'good' : 'neutral') as 'warn' | 'good' | 'neutral',
    icon: '🦺',
  };

  const _chart = {
    type: 'scale',
    marker: Math.round(primaFinalPct * 100) / 100,
    markerLabel: 'Tu prima',
    min: 0,
    unit: '%',
    segments: [
      { nombre: 'Mínima (0.5%)', max: 0.5, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Baja', max: 2, color: '#bfdbfe', colorDark: '#1e40af' },
      { nombre: 'Media', max: 5, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Alta', max: 10, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Máxima (15%)', max: 15, color: '#fecaca', colorDark: '#7f1d1d' },
    ],
    ariaLabel: `Prima de riesgo de trabajo de ${primaFinalPct.toFixed(2)}% en la escala legal de 0.5% a 15%.`,
  };

  return {
    primaFinal: primaFinalPct.toFixed(2) + '%',
    primaCalculada: primaCalcPct.toFixed(4) + '%' + (seAcoto ? ' (acotada por ley)' : ''),
    costoAnualRT: nominaSbcAnual > 0 ? fmtMXN(costoAnual) + ' al año' : 'Ingresa el SBC promedio para verlo en pesos',
    diferenciaVsActual: tieneActual && nominaSbcAnual > 0
      ? (diferenciaAnual >= 0 ? '+' : '−') + fmtMXN(Math.abs(diferenciaAnual)) + ' al año'
      : 'Ingresa tu prima actual y el SBC para compararlo',
    detalle: `Prima = [(${s}/365) + 28 × (${iDecimal.toFixed(4)} + ${d})] × (2.3/${n}) + 0.005 = ${primaCalcPct.toFixed(4)}%${tieneActual ? ` → acotada a ±1 punto de tu ${primaActualPct.toFixed(2)}% actual` : ''} → prima a declarar: ${primaFinalPct.toFixed(2)}% (vigente de marzo a febrero).`,
    mensaje: `Prima de riesgo de trabajo: ${primaFinalPct.toFixed(2)}% sobre el SBC${nominaSbcAnual > 0 ? ` ≈ ${fmtMXN(costoAnual)} al año para ${n} trabajadores` : ''}.`,
    _insight,
    _chart,
  };
}
