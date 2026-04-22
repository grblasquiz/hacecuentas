/**
 * Impuesto a las Ganancias — Trabajadores en relación de dependencia (4ta categoría)
 *
 * Usa los MISMOS valores y escala que la calc de sueldo en mano (sueldo-ar.ts):
 * ambos importan de `_ganancias-escala.ts` para que el fetcher auto-llm actualice
 * una sola vez y propague a las dos calcs.
 *
 * Base legal: Ley 20.628 + Ley 27.743 (Ley Bases 2024) + RG ARCA vigentes.
 */

import {
  MNI_MENSUAL_BASE,
  INCREMENTO_CONYUGE_MENSUAL,
  INCREMENTO_HIJO_MENSUAL,
  aplicarEscalaMensual,
} from './_ganancias-escala';

export interface GananciasSueldoInputs {
  brutoMensual: number;
  conyuge: boolean | string;
  hijos: number;
  otrasDeducciones?: number;
}

export interface GananciasSueldoOutputs {
  retencionMensual: number;
  retencionAnual: number;
  brutoAnual: number;
  aportesAnuales: number;
  aportesMensuales: number;
  netoDeAportesMensual: number;
  mniEfectivoMensual: number;
  deduccionFamiliaresMensual: number;
  otrasDeduccionesMensual: number;
  mniTotalMensual: number;
  baseImponibleMensual: number;
  baseImponibleAnual: number;
  alicuotaMarginal: string;
  alicuotaEfectiva: number;
  paga: boolean;
  mensaje: string;
  umbralMensual: number; // sueldo bruto desde el que empieza a pagar
}

export function gananciasSueldo(inputs: GananciasSueldoInputs): GananciasSueldoOutputs {
  const brutoMensual = Number(inputs.brutoMensual);
  const conyuge =
    inputs.conyuge === true ||
    inputs.conyuge === 'true' ||
    inputs.conyuge === 'si' ||
    inputs.conyuge === 1;
  const hijos = Math.max(0, Math.min(10, Number(inputs.hijos) || 0));
  const otrasMensuales = Math.max(0, Number(inputs.otrasDeducciones) || 0);

  if (!brutoMensual || brutoMensual <= 0) {
    throw new Error('Ingresá un sueldo bruto mensual válido');
  }

  // Aportes personales 17%
  const aportesMensuales = brutoMensual * 0.17;
  const netoDeAportesMensual = brutoMensual - aportesMensuales;

  // Familiares a cargo: ARCA diferencia cónyuge (~$404k/mes) de hijo (~$204k/mes).
  // Antes el código los igualaba — ahora aplica el valor exacto de cada uno.
  const deduccionConyugeMensual = conyuge ? INCREMENTO_CONYUGE_MENSUAL : 0;
  const deduccionHijosMensual = hijos * INCREMENTO_HIJO_MENSUAL;
  const deduccionFamiliaresMensual = deduccionConyugeMensual + deduccionHijosMensual;

  // Deducciones mensuales totales
  const mniTotalMensual = MNI_MENSUAL_BASE + deduccionFamiliaresMensual + otrasMensuales;

  // Base imponible mensual
  const baseImponibleMensual = Math.max(0, netoDeAportesMensual - mniTotalMensual);

  const { impuesto, marginal } = aplicarEscalaMensual(baseImponibleMensual);

  const retencionMensual = Math.round(impuesto);
  const retencionAnual = retencionMensual * 12;
  const brutoAnual = brutoMensual * 13; // 12 + SAC
  const aportesAnuales = aportesMensuales * 13;

  const alicuotaEfectiva = brutoAnual > 0 ? (retencionAnual / brutoAnual) * 100 : 0;
  const paga = retencionMensual > 0;

  // Umbral: sueldo bruto desde el cual empieza a pagar
  // base > 0 cuando bruto × 0.83 > mniTotal → bruto > mniTotal / 0.83
  const umbralMensual = Math.round(mniTotalMensual / 0.83);

  const mensaje = paga
    ? `Te retienen aproximadamente $${retencionMensual.toLocaleString('es-AR')} por mes. Tu sueldo en mano se reduce en esa cifra por Ganancias.`
    : `Tu sueldo no supera el mínimo no imponible (~$${umbralMensual.toLocaleString('es-AR')}/mes en tu caso) — no pagás Ganancias.`;

  return {
    retencionMensual,
    retencionAnual: Math.round(retencionAnual),
    brutoAnual: Math.round(brutoAnual),
    aportesAnuales: Math.round(aportesAnuales),
    aportesMensuales: Math.round(aportesMensuales),
    netoDeAportesMensual: Math.round(netoDeAportesMensual),
    mniEfectivoMensual: MNI_MENSUAL_BASE,
    deduccionFamiliaresMensual: Math.round(deduccionFamiliaresMensual),
    otrasDeduccionesMensual: Math.round(otrasMensuales),
    mniTotalMensual: Math.round(mniTotalMensual),
    baseImponibleMensual: Math.round(baseImponibleMensual),
    baseImponibleAnual: Math.round(baseImponibleMensual * 12),
    alicuotaMarginal: paga ? `${Math.round(marginal * 100)}%` : '—',
    alicuotaEfectiva: Number(alicuotaEfectiva.toFixed(2)),
    paga,
    mensaje,
    umbralMensual,
  };
}
