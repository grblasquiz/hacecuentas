/**
 * Ahorro en comisiones con Bre-B vs transferencia interbancaria con costo — Colombia 2026.
 * Bre-B (pagos inmediatos del Banco de la República, operando desde sep-2025) es GRATIS para personas
 * naturales durante los primeros años; el cobro llegaría recién en sep-2029 con un valor definido de
 * $6,46/operación. Las transferencias tradicionales cuestan entre $4.600 y $14.518 según el banco
 * (El Colombiano, 2025-2026). El costo actual del banco lo ingresa el usuario. Data país importada.
 */
import { BRE_B_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  transferencias_mes: number;
  costo_por_transferencia: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const n = Number(i.transferencias_mes);
  if (!Number.isFinite(n) || n <= 0) throw new Error('Ingresa cuántas transferencias haces al mes');
  const costo = Number(i.costo_por_transferencia);
  if (!Number.isFinite(costo) || costo < 0) throw new Error('Ingresa lo que te cobra tu banco por transferencia (míralo en el extracto)');

  const gastoMes = n * costo;
  const gastoAnual = gastoMes * 12;
  const costoFuturoAnual = n * BRE_B_2026.costoFuturoPorOperacion * 12;

  const _insight = {
    title: `Con Bre-B te ahorras ${fmtCOP(gastoAnual)} al año`,
    text: `Haciendo **${n.toLocaleString('es-CO')} transferencias al mes** a **${fmtCOP(costo)}** cada una, hoy gastas **${fmtCOP(gastoMes)}/mes** (${fmtCOP(gastoAnual)}/año). Con las llaves de **Bre-B** ese costo es **$0** para personas: el cobro recién llegaría en sep-2029 y el valor definido es de $6,46 por operación (${fmtCOP(costoFuturoAnual)}/año a tu ritmo). El tope por transacción es ${fmtCOP(BRE_B_2026.topePorTransaccion)} (1.000 UVB).`,
    tone: 'good',
    icon: '🔑',
  };

  const _chart = {
    type: 'bar',
    labels: ['Transferencia con costo (año)', 'Bre-B hoy (año)'],
    values: [Math.round(gastoAnual), 0],
    prefix: '$',
    ariaLabel: `Gasto anual con transferencias cobradas ${fmtCOP(gastoAnual)} frente a $0 con Bre-B.`,
  };

  return {
    ahorro_mensual: fmtCOP(gastoMes),
    ahorro_anual: fmtCOP(gastoAnual),
    costo_bre_b_hoy: '$0 (gratis para personas)',
    costo_bre_b_futuro: `${fmtCOP(costoFuturoAnual)}/año desde sep-2029 ($6,46 por operación)`,
    detalle: `${n.toLocaleString('es-CO')} transferencias × ${fmtCOP(costo)} × 12 meses = ${fmtCOP(gastoAnual)} que dejas de pagar usando Bre-B.`,
    _insight,
    _chart,
  };
}
