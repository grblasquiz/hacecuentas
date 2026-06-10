/** Aguinaldo neto México con desglose ISR detallado
 *  Diferenciado del aguinaldo-mexico existente: foco en neto + tabla ISR completa
 *  + comparativa con salario mensual
 *
 *  Datos fiscales (UMA 2026, tarifa ISR mensual 2026, exención 30 UMA): fuente única
 *  src/lib/data/mexico-2026.ts. Antes estaban hardcodeados con valores 2025.
 */
import { MEXICO_2026, isrMensual2026 } from '../data/mexico-2026';

export interface Inputs {
  sueldoMensual: number;
  diasAguinaldo: number;
  mesesTrabajados: number;
  tieneCredito: string;
}

export interface Outputs {
  aguinaldoBruto: number;
  exentoIsr: number;
  gravado: number;
  isrRetenido: number;
  aguinaldoNeto: number;
  equivalenteSueldos: number;
  formula: string;
  explicacion: string;
  _chart?: any;
  _insight?: any;
}

// ISR sobre el monto gravado: tarifa mensual 2026 (Art. 96 LISR) de mexico-2026.
function calcISR(base: number): number {
  if (base <= 0) return 0;
  return isrMensual2026(base);
}

export function aguinaldoMexicoNeto(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual);
  const diasAg = Number(i.diasAguinaldo) || 15;
  const mesesT = Math.min(12, Math.max(1, Number(i.mesesTrabajados) || 12));

  if (!sueldo || sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');

  const salarioDiario = sueldo / 30;
  const aguinaldoBruto = salarioDiario * diasAg * (mesesT / 12);

  // Exención: 30 UMA diarias (Art. 93 LISR). UMA 2026 y tope: fuente única mexico-2026.
  const UMA_DIARIO = MEXICO_2026.uma.diaria;
  const exentoIsr = Math.min(aguinaldoBruto, UMA_DIARIO * MEXICO_2026.exencionesIsrUmas.aguinaldo);
  const gravado = Math.max(0, aguinaldoBruto - exentoIsr);
  const isrRetenido = calcISR(gravado);
  const aguinaldoNeto = aguinaldoBruto - isrRetenido;
  const equivalenteSueldos = sueldo > 0 ? aguinaldoNeto / sueldo : 0;

  const formula = `Neto = ($${salarioDiario.toFixed(2)} × ${diasAg} × ${mesesT}/12) - ISR($${gravado.toFixed(2)}) = $${aguinaldoNeto.toFixed(2)}`;
  const explicacion = `Con sueldo mensual de $${sueldo.toLocaleString('es-MX')} MXN (diario: $${salarioDiario.toFixed(2)}) y ${diasAg} días de aguinaldo${mesesT < 12 ? ` (proporcional ${mesesT} meses)` : ''}: bruto $${Math.round(aguinaldoBruto).toLocaleString('es-MX')}, exento $${Math.round(exentoIsr).toLocaleString('es-MX')}, gravado $${Math.round(gravado).toLocaleString('es-MX')}, ISR $${Math.round(isrRetenido).toLocaleString('es-MX')}. Neto en mano: $${Math.round(aguinaldoNeto).toLocaleString('es-MX')} MXN (equivale a ${equivalenteSueldos.toFixed(2)} sueldos).`;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto en mano', value: Math.round(aguinaldoNeto) },
      { label: 'ISR retenido', value: Math.round(isrRetenido) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(aguinaldoBruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto',
    ariaLabel: `Composición del aguinaldo bruto: neto ${Math.round(aguinaldoNeto)}, ISR retenido ${Math.round(isrRetenido)}.`,
  };

  // Insight narrativo: cuánto neto queda, qué se lleva el ISR y a cuántos sueldos equivale.
  const isrPct = aguinaldoBruto > 0 ? (isrRetenido / aguinaldoBruto) * 100 : 0;
  const netoRound = Math.round(aguinaldoNeto);
  const isrRound = Math.round(isrRetenido);
  let insight: any;
  if (isrRound <= 0) {
    insight = {
      title: 'Aguinaldo sin ISR',
      text: `Tu aguinaldo de **$${netoRound.toLocaleString('es-MX')} MXN** queda exento de ISR (no supera las 30 UMA). Lo cobrás completo: equivale a **${equivalenteSueldos.toFixed(2)} sueldos** mensuales.`,
      tone: 'good' as const,
      icon: '🎉',
    };
  } else {
    insight = {
      title: 'El ISR recorta tu aguinaldo',
      text: `Te quedan **$${netoRound.toLocaleString('es-MX')} MXN** netos (**${equivalenteSueldos.toFixed(2)} sueldos**): el ISR se lleva **$${isrRound.toLocaleString('es-MX')}**, el **${isrPct.toFixed(1)}%** del bruto. Solo se grava lo que pasa de 30 UMA.`,
      tone: 'warn' as const,
      icon: '🎄',
    };
  }

  return {
    aguinaldoBruto: Math.round(aguinaldoBruto),
    exentoIsr: Math.round(exentoIsr),
    gravado: Math.round(gravado),
    isrRetenido: Math.round(isrRetenido),
    aguinaldoNeto: Math.round(aguinaldoNeto),
    equivalenteSueldos: Number(equivalenteSueldos.toFixed(2)),
    formula,
    explicacion,
    _chart: chart,
    _insight: insight,
  };
}
