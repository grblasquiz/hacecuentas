/**
 * ITF — Impuesto a las Transacciones Financieras (Perú).
 * Tasa vigente 2026: 0,005% por operación gravada (Ley 28194, vigente desde 2011).
 * El banco retiene el ITF automáticamente sobre débitos/créditos en cuentas afectas.
 * Operaciones exoneradas (cuenta sueldo, CTS, AFP, entre cuentas del mismo titular) NO pagan ITF.
 */
import { fmtPEN } from '../data/peru-2026.ts';

// Tasa ITF vigente. Fuente: SUNAT, https://orientacion.sunat.gob.pe/03-tasa-del-impuesto-las-transacciones-financieras, 2026 (Ley 28194).
const TASA_ITF = 0.00005; // 0,005%
// Umbral de bancarización obligatoria. Fuente: Ley 30730 (modif. Ley 28194), vigente desde abr-2022, sin cambios a 2026.
const UMBRAL_BANCARIZACION_PEN = 2000; // S/
const UMBRAL_BANCARIZACION_USD = 500;  // US$

export interface Inputs {
  monto: number;            // monto de la operación (S/)
  numOperaciones?: number;  // cantidad de operaciones del mismo monto (default 1)
  exonerada?: string;       // 'si' si la operación/cuenta está exonerada (cuenta sueldo, CTS, AFP, mismo titular)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const nOps = Math.max(1, Math.floor(Number(i.numOperaciones) || 1));
  const exonerada = String(i.exonerada || 'no') === 'si';
  if (monto <= 0) throw new Error('Ingresá el monto de la operación en soles');

  // ITF por operación = monto × 0,005% (redondeado al céntimo, como retiene el banco).
  const itfPorOperacionExacto = exonerada ? 0 : monto * TASA_ITF;
  const itfPorOperacion = Math.round(itfPorOperacionExacto * 100) / 100;
  const itfTotal = Math.round(itfPorOperacion * nOps * 100) / 100;

  const montoTotalMovido = monto * nOps;
  const recibesNeto = montoTotalMovido - itfTotal; // lo que queda tras la retención

  // Bancarización: las operaciones desde S/ 2.000 / US$ 500 DEBEN usar el sistema financiero.
  const requiereBancarizacion = monto >= UMBRAL_BANCARIZACION_PEN;

  let insightTitle: string, insightText: string, insightTone: string, insightIcon: string;
  if (exonerada) {
    insightTitle = 'Operación exonerada: ITF = S/ 0,00';
    insightText = `Las operaciones en **cuenta sueldo, CTS, AFP** o **transferencias entre cuentas de tu propio titular** están **exoneradas del ITF** (Ley 28194). Por mover **${fmtPEN(montoTotalMovido)}** no pagás **nada** de ITF.`;
    insightTone = 'good';
    insightIcon = '✅';
  } else {
    const pctSobreMonto = montoTotalMovido > 0 ? (itfTotal / montoTotalMovido) * 100 : 0;
    insightTitle = `ITF a pagar: ${fmtPEN(itfTotal)}`;
    insightText = `Por mover **${fmtPEN(montoTotalMovido)}** en ${nOps === 1 ? 'una operación gravada' : `${nOps} operaciones gravadas`}, el banco te retiene **${fmtPEN(itfTotal)}** de ITF (0,005% por operación). Es apenas el **${pctSobreMonto.toFixed(4)}%** de lo movido: por cada **S/ 1.000** pagás **S/ 0,05**. La retención es automática y aparece como cargo separado en tu estado de cuenta.`;
    insightTone = itfTotal > 0 ? 'neutral' : 'good';
    insightIcon = '🏧';
  }

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone: insightTone,
    icon: insightIcon,
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Monto movido', value: Math.round(recibesNeto) },
      { label: 'ITF (0,005%)', value: Math.round(itfTotal * 100) / 100 },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(itfTotal),
    centerLabel: 'ITF total',
    ariaLabel: `Sobre ${fmtPEN(montoTotalMovido)} movidos, el ITF total es ${fmtPEN(itfTotal)}.`,
  };

  return {
    itfTotal: fmtPEN(itfTotal),
    itfPorOperacion: fmtPEN(itfPorOperacion),
    montoMovido: fmtPEN(montoTotalMovido),
    recibesNeto: fmtPEN(recibesNeto),
    bancarizacion: requiereBancarizacion
      ? `Sí: por ser ≥ ${fmtPEN(UMBRAL_BANCARIZACION_PEN)} (o US$ ${UMBRAL_BANCARIZACION_USD}), esta operación debe pagarse por el sistema financiero (Ley 28194).`
      : `No obligatoria: el monto es menor a ${fmtPEN(UMBRAL_BANCARIZACION_PEN)} (umbral de bancarización), aunque igual conviene usar el banco.`,
    detalle: exonerada
      ? `Operación exonerada del ITF — no se retiene nada sobre ${fmtPEN(montoTotalMovido)}.`
      : `0,005% × ${fmtPEN(monto)} = ${fmtPEN(itfPorOperacion)} por operación × ${nOps} = ${fmtPEN(itfTotal)}.`,
    _insight,
    _chart,
  };
}
