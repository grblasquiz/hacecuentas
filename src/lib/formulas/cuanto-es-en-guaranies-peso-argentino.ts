/**
 * Conversor Peso argentino (ARS) ↔ Guaraní (PYG).
 * Cotización de referencia del BCP (frontera Encarnación / Posadas). La tasa NO
 * se hardcodea: viene de TIPO_CAMBIO_PY.arsPyg.
 */
import { TIPO_CAMBIO_PY, fmtPYG } from '../data/paraguay-2026.ts';

export interface Inputs {
  monto?: number;
  direccion?: string;   // 'ars-pyg' (pesos → guaraníes) | 'pyg-ars' (guaraníes → pesos)
}

export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

function fmtARS(n: number): string {
  return '$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function cuantoEsEnGuaraniesPesoArgentino(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const direccion = String(i.direccion || 'ars-pyg') === 'pyg-ars' ? 'pyg-ars' : 'ars-pyg';
  if (monto <= 0) throw new Error('Ingresá el monto a convertir');

  const tc = TIPO_CAMBIO_PY.arsPyg; // 1 ARS = X Gs.

  let resultado: number;
  let resultadoFmt: string;
  let detalle: string;
  if (direccion === 'ars-pyg') {
    resultado = monto * tc;
    resultadoFmt = fmtPYG(resultado);
    detalle = `${fmtARS(monto)} × ${tc.toLocaleString('de-DE', { minimumFractionDigits: 2 })} = ${fmtPYG(resultado)}.`;
  } else {
    resultado = monto / tc;
    resultadoFmt = fmtARS(resultado);
    detalle = `${fmtPYG(monto)} ÷ ${tc.toLocaleString('de-DE', { minimumFractionDigits: 2 })} = ${fmtARS(resultado)}.`;
  }

  // Como el ARS vale muy poco en guaraníes, mostramos montos altos típicos
  const _table = {
    title: `Pesos argentinos a guaraníes (TC ${tc.toLocaleString('de-DE', { minimumFractionDigits: 2 })})`,
    headers: ['Pesos (ARS)', 'Guaraníes (PYG)'],
    rows: [
      ['$ 100', fmtPYG(100 * tc)],
      ['$ 1.000', fmtPYG(1000 * tc)],
      ['$ 5.000', fmtPYG(5000 * tc)],
      ['$ 10.000', fmtPYG(10000 * tc)],
      ['$ 50.000', fmtPYG(50000 * tc)],
      ['$ 100.000', fmtPYG(100000 * tc)],
    ],
    note: `Cotización referencial BCP al ${TIPO_CAMBIO_PY.asOf}. En las casas de cambio de Encarnación el valor de compra/venta tiene un spread propio y suele moverse más que la referencia.`,
  };

  const _insight = {
    type: 'highlight',
    icon: '🇦🇷',
    text:
      direccion === 'ars-pyg'
        ? `**${fmtARS(monto)}** equivalen a **${fmtPYG(resultado)}** a la cotización de referencia del BCP (1 ARS = ${tc.toLocaleString('de-DE', { minimumFractionDigits: 2 })} Gs.).`
        : `**${fmtPYG(monto)}** equivalen a **${fmtARS(resultado)}** a la cotización de referencia del BCP (1 ARS = ${tc.toLocaleString('de-DE', { minimumFractionDigits: 2 })} Gs.).`,
  };

  return {
    resultado: resultadoFmt,
    cotizacion: `1 ARS = ${fmtPYG(tc)}`,
    detalle,
    _table,
    _insight,
  };
}
