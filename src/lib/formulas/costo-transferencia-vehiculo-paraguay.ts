/**
 * Costo de transferencia de vehículo — PARAGUAY.
 *
 * Al comprar un auto usado, la transferencia se hace por escritura pública ante
 * escribano y se inscribe en el Registro del Automotor (Dirección General de los
 * Registros Públicos, Poder Judicial). Los costos principales:
 *
 *  1. Honorario del escribano — Arancel del Notario Público (Ley 1307/87), una
 *     escala decreciente del 2% al 0,75% según el valor, con mínimo de 5 jornales.
 *     Al honorario se le suma el IVA (10%).
 *  2. Tasa judicial de inscripción en el Registro del Automotor — ~0,5% del valor.
 *  3. Certificados: informe de la Policía Nacional (no robo) y libre deuda de
 *     patente municipal — montos fijos referenciales.
 *
 * Los honorarios del escribano están regulados a nivel nacional; las tasas
 * municipales varían por ciudad. Moneda: guaraníes (PYG).
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026.ts';

// Escala del arancel notarial (Ley 1307/87): % decreciente según el valor.
function tasaNotarial(valor: number): number {
  if (valor <= 50_000_000) return 0.02;    // 2%
  if (valor <= 75_000_000) return 0.0175;  // 1,75%
  if (valor <= 100_000_000) return 0.015;  // 1,5%
  if (valor <= 150_000_000) return 0.0125; // 1,25%
  if (valor <= 200_000_000) return 0.01;   // 1%
  return 0.0075;                            // 0,75%
}

const TASA_JUDICIAL = 0.005;          // ~0,5% del valor (inscripción Registro del Automotor)
const CERT_POLICIA = 100000;          // informe Policía Nacional (no robo), referencial
const CERT_MUNICIPAL = 80000;         // libre deuda de patente municipal, referencial

export interface Inputs {
  valorVehiculo: number;       // valor de la operación / tasación del vehículo, en Gs.
  incluirCertificados?: string; // 'si' suma los certificados de policía y municipal
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

export function compute(i: Inputs): Outputs {
  const valor = Number(i.valorVehiculo) || 0;
  if (valor <= 0) throw new Error('Ingresá el valor del vehículo');
  const conCertificados = String(i.incluirCertificados || 'si') === 'si';

  const rate = tasaNotarial(valor);
  const minimo = 5 * PARAGUAY_2026.jornalMinimo; // mínimo 5 jornales
  const honorarioBase = Math.max(valor * rate, minimo);
  const iva = honorarioBase * PARAGUAY_2026.iva.general; // 10%
  const honorarioConIva = Math.round(honorarioBase + iva);

  const tasaJudicial = Math.round(valor * TASA_JUDICIAL);
  const certificados = conCertificados ? CERT_POLICIA + CERT_MUNICIPAL : 0;

  const costoTotal = honorarioConIva + tasaJudicial + certificados;

  const _table = {
    title: 'Desglose del costo de transferencia',
    headers: ['Concepto', 'Base', 'Monto'],
    rows: [
      [`Honorario escribano (${(rate * 100).toLocaleString('de-DE')}% + IVA)`, `${fmtPYG(valor)} × ${(rate * 100).toLocaleString('de-DE')}%`, fmtPYG(honorarioConIva)],
      ['Tasa judicial (inscripción)', `${fmtPYG(valor)} × 0,5%`, fmtPYG(tasaJudicial)],
      ['Certificados (policía + municipal)', conCertificados ? 'montos fijos' : 'no incluidos', fmtPYG(certificados)],
      ['Costo total estimado', '', fmtPYG(costoTotal)],
    ],
    note: 'Honorario del escribano según arancel Ley 1307/87 (mínimo 5 jornales) + IVA 10%. La tasa judicial y los certificados son referenciales; el escribano puede sumar fojas y sellados, y las tasas municipales varían por ciudad.',
  };

  const _insight = {
    type: 'highlight',
    icon: '🚗',
    text: `Transferir un vehículo de **${fmtPYG(valor)}** cuesta alrededor de **${fmtPYG(costoTotal)}**: el honorario del escribano con IVA (${fmtPYG(honorarioConIva)}) es el componente más grande, más la tasa judicial de inscripción (${fmtPYG(tasaJudicial)})${conCertificados ? ` y los certificados (${fmtPYG(certificados)})` : ''}.`,
  };

  return {
    honorarioEscribano: fmtPYG(honorarioConIva),
    tasaJudicial: fmtPYG(tasaJudicial),
    certificados: fmtPYG(certificados),
    costoTotal: fmtPYG(costoTotal),
    detalle: `Honorario ${fmtPYG(honorarioConIva)} (con IVA) + tasa judicial ${fmtPYG(tasaJudicial)}${conCertificados ? ` + certificados ${fmtPYG(certificados)}` : ''} = ${fmtPYG(costoTotal)}.`,
    _insight,
    _table,
  };
}
