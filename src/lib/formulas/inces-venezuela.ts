/**
 * Aporte INCES Venezuela — Ley del INCES (Instituto Nacional de Capacitación y
 * Educación Socialista).
 *
 *  - APORTE PATRONAL: 2% del total de sueldos, salarios, jornales y remuneraciones
 *    pagados al personal en el trimestre (lo paga el patrono).
 *  - RETENCIÓN AL TRABAJADOR: 0,5% de las utilidades anuales (aguinaldos) que el
 *    patrono retiene a los trabajadores y entera al INCES.
 *
 * El patrono entera la suma de ambos conceptos. Declaración trimestral.
 *
 * Fuente: Ley del INCES (G.O. 38.958), Art. 14.
 */
import { fmtVES } from '../data/venezuela-2026';

const TASA_PATRONAL = 0.02;   // 2% sobre sueldos/salarios del trimestre
const TASA_TRABAJADOR = 0.005; // 0,5% sobre utilidades del trabajador

export interface Inputs {
  totalSueldosTrim: number;   // total de sueldos/salarios pagados en el trimestre (Bs.)
  utilidadesPagadas: number;  // utilidades/aguinaldos pagados a los trabajadores (Bs.)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function incesVenezuela(i: Inputs): Outputs {
  const totalSueldosTrim = Math.max(0, Number(i.totalSueldosTrim) || 0);
  const utilidadesPagadas = Math.max(0, Number(i.utilidadesPagadas) || 0);

  if (totalSueldosTrim <= 0 && utilidadesPagadas <= 0) {
    throw new Error('Ingresá el total de sueldos del trimestre o las utilidades pagadas');
  }

  const aportePatronal = totalSueldosTrim * TASA_PATRONAL;
  const retencionTrabajador = utilidadesPagadas * TASA_TRABAJADOR;
  const totalEnterar = aportePatronal + retencionTrabajador;

  const _insight = {
    type: 'highlight',
    icon: '🏫',
    text: `Sobre **${fmtVES(totalSueldosTrim)}** de sueldos del trimestre, el aporte patronal al INCES es **${fmtVES(aportePatronal)}** (2%). ` +
      `Además, sobre **${fmtVES(utilidadesPagadas)}** de utilidades se retiene **${fmtVES(retencionTrabajador)}** a los trabajadores (0,5%). ` +
      `El patrono entera al INCES un total de **${fmtVES(totalEnterar)}**.`,
  };

  const _table = {
    title: 'Desglose del aporte INCES',
    headers: ['Concepto', 'Base', 'Tasa', 'Monto'],
    rows: [
      ['Aporte patronal', fmtVES(totalSueldosTrim), '2%', fmtVES(aportePatronal)],
      ['Retención al trabajador', fmtVES(utilidadesPagadas), '0,5%', fmtVES(retencionTrabajador)],
      ['Total a enterar al INCES', '—', '—', fmtVES(totalEnterar)],
    ],
    note: 'El aporte patronal (2%) lo asume la empresa; la retención (0,5%) se descuenta de las utilidades del trabajador. Ambos los entera el patrono al INCES.',
  };

  return {
    aportePatronal: Number(aportePatronal.toFixed(2)),
    retencionTrabajador: Number(retencionTrabajador.toFixed(2)),
    totalEnterar: Number(totalEnterar.toFixed(2)),
    detalle: `Patronal ${fmtVES(aportePatronal)} (2%) + retención ${fmtVES(retencionTrabajador)} (0,5%) = ${fmtVES(totalEnterar)}`,
    _insight,
    _table,
  };
}
