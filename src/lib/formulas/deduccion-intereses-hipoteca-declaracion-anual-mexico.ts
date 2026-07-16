/**
 * Deducción de intereses reales de hipoteca en la Declaración Anual (LISR Art. 151-IV).
 * Aplica el tope global de deducciones personales — el MENOR entre 5 UMA anuales y el 15%
 * del ingreso (LISR Art. 151) — y estima el ahorro en ISR con la tarifa anual 2026.
 * UMA, tope y tarifa ISR salen de la fuente única src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, isrAnual2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  interesesRealesPagados: number;     // intereses reales del año, de la constancia del banco ($)
  ingresoAnualGravable: number;       // ingreso anual acumulable ($)
  otrasDeduccionesPersonales: number; // otras deducciones personales ya usadas ($)
}

export interface Outputs {
  topeGlobalDeducciones: number;
  deduccionInteresesAplicable: number;
  baseGravableConDeduccion: number;
  isrSinDeduccion: number;
  isrConDeduccion: number;
  ahorroFiscal: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const { uma, deduccionesPersonales } = MEXICO_2026;

  const intereses = Math.max(0, Number(i.interesesRealesPagados) || 0);
  const ingreso = Math.max(0, Number(i.ingresoAnualGravable) || 0);
  const otras = Math.max(0, Number(i.otrasDeduccionesPersonales) || 0);

  // Tope global de deducciones personales: el MENOR entre 5 UMA anuales y 15% del ingreso.
  const topePorUma = deduccionesPersonales.topeUmasAnuales * uma.anual;
  const topePorPorcentaje = ingreso * deduccionesPersonales.topePorcentajeIngresos;
  const topeGlobal = Math.min(topePorUma, topePorPorcentaje);

  // Los intereses compiten con las otras deducciones por el mismo tope.
  const espacioParaIntereses = Math.max(0, topeGlobal - otras);
  const deduccionInteresesAplicable = Math.min(intereses, espacioParaIntereses);

  const baseGravableConDeduccion = Math.max(0, ingreso - deduccionInteresesAplicable);
  const isrSinDeduccion = isrAnual2026(ingreso);
  const isrConDeduccion = isrAnual2026(baseGravableConDeduccion);
  const ahorroFiscal = Math.max(0, isrSinDeduccion - isrConDeduccion);

  const round2 = (n: number) => Math.round(n * 100) / 100;

  const _insight = {
    title: 'Ahorro por deducir tu hipoteca',
    text: `De **${fmtMXN(intereses)}** de intereses reales, podés deducir **${fmtMXN(deduccionInteresesAplicable)}** (tope global de deducciones personales: **${fmtMXN(topeGlobal)}**). Eso baja tu ISR anual de **${fmtMXN(isrSinDeduccion)}** a **${fmtMXN(isrConDeduccion)}**: un ahorro estimado de **${fmtMXN(ahorroFiscal)}** que suele volver como saldo a favor.`,
    tone: 'good',
    icon: '🏦',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['ISR sin deducir', 'ISR con deducción'],
    values: [Math.round(isrSinDeduccion), Math.round(isrConDeduccion)],
    prefix: '$',
    ariaLabel: `ISR sin deducir ${fmtMXN(isrSinDeduccion)} frente a ISR con deducción ${fmtMXN(isrConDeduccion)}.`,
  };

  return {
    topeGlobalDeducciones: round2(topeGlobal),
    deduccionInteresesAplicable: round2(deduccionInteresesAplicable),
    baseGravableConDeduccion: round2(baseGravableConDeduccion),
    isrSinDeduccion: round2(isrSinDeduccion),
    isrConDeduccion: round2(isrConDeduccion),
    ahorroFiscal: round2(ahorroFiscal),
    _insight,
    _chart,
  };
}
