/**
 * Calculadora RESICO Personas Morales México 2026 (ISR sobre flujo de efectivo).
 *
 * Régimen Simplificado de Confianza para personas morales — LISR Arts. 206-215.
 * Aplica a sociedades constituidas SOLO por personas físicas con ingresos totales del
 * ejercicio inmediato anterior menores a 35 MDP. La base NO es la utilidad fiscal devengada
 * del régimen general (601): se determina por FLUJO DE EFECTIVO →
 *   base = ingresos EFECTIVAMENTE COBRADOS − deducciones autorizadas EFECTIVAMENTE PAGADAS
 * y a esa base se le aplica la tasa del Art. 9 LISR (30%, la misma de personas morales).
 * Pagos provisionales mensuales ACUMULADOS (Art. 211): de enero al mes que se calcula.
 * No hay ajuste anual por inflación, ni CUCA/CUFIN, ni coeficiente de utilidad.
 *
 * NO confundir con RESICO Personas Físicas (Art. 113-E): tarifa 1%-2.5% sobre ingresos.
 */

import { MEXICO_2026, fmtMXN } from '../data/mexico-2026.ts';

// Tasa de personas morales (Art. 9 LISR) — la misma que aplica RESICO PM (Art. 206).
const TASA_ISR_PM = 0.30;
// Tope de ingresos del ejercicio inmediato anterior para permanecer en RESICO PM (Art. 206 LISR).
const TOPE_INGRESOS_RESICO_PM = 35_000_000;

export interface Inputs {
  /** Ingresos efectivamente COBRADOS en el periodo (acumulados de enero al mes que se calcula). */
  ingresosCobrados: number;
  /** Deducciones autorizadas efectivamente PAGADAS en el periodo (mismo acumulado). */
  deduccionesPagadas: number;
  /** Pagos provisionales de ISR enterados en meses anteriores del mismo ejercicio (opcional). */
  pagosProvisionalesPrevios?: number;
  /** PTU pagada en el ejercicio, disminuible de la utilidad (opcional). */
  ptuPagada?: number;
}

export interface Outputs {
  ingresosCobrados: number;
  deduccionesPagadas: number;
  baseGravable: number;
  isrCausado: number;
  pagoProvisionalDelMes: number;
  tasaEfectiva: number;
  margenFlujo: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

function num(v: unknown): number {
  const n = typeof v === 'string' ? parseFloat(v.replace(/[, $]/g, '')) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function resicoPersonasMoralesMexico2026(i: Inputs): Outputs {
  const ingresos = num(i.ingresosCobrados);
  if (!ingresos || ingresos <= 0) throw new Error('Ingresá los ingresos efectivamente cobrados');

  const deducciones = Math.max(0, num(i.deduccionesPagadas));
  const ptu = Math.max(0, num(i.ptuPagada));
  const pagosPrevios = Math.max(0, num(i.pagosProvisionalesPrevios));

  // Base por flujo de efectivo (Arts. 207-210 LISR): cobrado − pagado − PTU, nunca negativa para el ISR.
  const baseAntesPtu = ingresos - deducciones;
  const baseGravable = Math.max(0, baseAntesPtu - ptu);

  // ISR del 30% (Art. 9 LISR) sobre la base acumulada.
  const isrCausado = Math.round(baseGravable * TASA_ISR_PM * 100) / 100;

  // Pago provisional del mes = ISR causado acumulado − pagos provisionales previos del ejercicio.
  const pagoProvisionalDelMes = Math.round(Math.max(0, isrCausado - pagosPrevios) * 100) / 100;

  // Tasa efectiva sobre ingresos cobrados y margen de flujo.
  const tasaEfectiva = ingresos > 0 ? Math.round((isrCausado / ingresos) * 1000) / 10 : 0;
  const margenFlujo = ingresos > 0 ? Math.round((baseAntesPtu / ingresos) * 1000) / 10 : 0;

  const superaTope = ingresos > TOPE_INGRESOS_RESICO_PM;

  let insightText: string;
  let tone: 'good' | 'neutral' | 'warn';
  if (baseGravable <= 0) {
    insightText = `En el periodo pagaste tanto o más de lo que cobraste (${fmtMXN(ingresos)} cobrados vs ${fmtMXN(deducciones + ptu)} entre deducciones pagadas y PTU), así que **no hay base gravable y el ISR es $0**. En RESICO PM solo pagás cuando el flujo de efectivo es positivo: el gasto que aún no pagaste no resta, y el ingreso que aún no cobraste no suma.`;
    tone = 'neutral';
  } else if (superaTope) {
    insightText = `Cobraste ${fmtMXN(ingresos)}, que **supera el tope de ${fmtMXN(TOPE_INGRESOS_RESICO_PM)}** del ejercicio inmediato anterior para permanecer en RESICO PM (Art. 206 LISR). El ISR del 30% sobre tu flujo (${fmtMXN(baseGravable)}) da ${fmtMXN(isrCausado)}, pero si rebasaste el límite tendrías que tributar en el régimen general desde el ejercicio siguiente. Verificá tu nivel de ingresos.`;
    tone = 'warn';
  } else {
    insightText = `Sobre un flujo positivo de ${fmtMXN(baseGravable)} (cobraste ${fmtMXN(ingresos)}, pagaste ${fmtMXN(deducciones + ptu)} deducibles), el ISR del 30% es **${fmtMXN(isrCausado)}** — una tasa efectiva del **${tasaEfectiva}%** sobre lo cobrado. ${pagosPrevios > 0 ? `Descontando ${fmtMXN(pagosPrevios)} de pagos provisionales previos, este mes enterás ${fmtMXN(pagoProvisionalDelMes)}.` : 'Lo que aún no cobraste no genera ISR todavía: esa es la ventaja del flujo de efectivo.'}`;
    tone = 'good';
  }

  const _insight = {
    title: baseGravable <= 0 ? 'Sin ISR este periodo' : superaTope ? 'Ojo con el tope de 35 MDP' : 'Pagás solo sobre lo cobrado',
    text: insightText,
    tone,
    icon: '🏢',
  };

  const out: Outputs = {
    ingresosCobrados: Math.round(ingresos * 100) / 100,
    deduccionesPagadas: Math.round((deducciones + ptu) * 100) / 100,
    baseGravable: Math.round(baseGravable * 100) / 100,
    isrCausado,
    pagoProvisionalDelMes,
    tasaEfectiva,
    margenFlujo,
    mensaje: `Sobre un flujo de efectivo de ${fmtMXN(baseGravable)}, el ISR RESICO PM (30%) es ${fmtMXN(isrCausado)}.`,
    _insight,
  };

  // Barra apilada: ingresos cobrados = ISR + deducciones+PTU + utilidad neta de flujo después de ISR.
  if (ingresos > 0 && baseGravable > 0) {
    const utilidadDespuesIsr = Math.round((baseGravable - isrCausado) * 100) / 100;
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'ISR (30%)', value: isrCausado },
        { label: 'Deducciones + PTU pagadas', value: Math.round((deducciones + ptu) * 100) / 100 },
        { label: 'Utilidad de flujo después de ISR', value: utilidadDespuesIsr },
      ],
      prefix: '$',
      centerValue: fmtMXN(ingresos),
      centerLabel: 'Ingresos cobrados',
      ariaLabel: 'Reparto de los ingresos cobrados entre ISR del 30%, deducciones y PTU pagadas, y utilidad de flujo después de impuesto',
    };
  }

  return out;
}
