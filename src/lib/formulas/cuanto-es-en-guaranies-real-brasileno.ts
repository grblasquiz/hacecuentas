/**
 * Conversor Real brasileño (BRL) ↔ Guaraní (PYG).
 * Cotización de referencia del BCP (frontera Ciudad del Este). La tasa NO se
 * hardcodea: viene de TIPO_CAMBIO_PY.brlPyg.
 */
import { TIPO_CAMBIO_PY, fmtPYG } from '../data/paraguay-2026.ts';

export interface Inputs {
  monto?: number;
  direccion?: string;   // 'brl-pyg' (reales → guaraníes) | 'pyg-brl' (guaraníes → reales)
}

export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

function fmtBRL(n: number): string {
  return 'R$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function cuantoEsEnGuaraniesRealBrasileno(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const direccion = String(i.direccion || 'brl-pyg') === 'pyg-brl' ? 'pyg-brl' : 'brl-pyg';
  if (monto <= 0) throw new Error('Ingresá el monto a convertir');

  const tc = TIPO_CAMBIO_PY.brlPyg; // 1 BRL = X Gs.

  let resultado: number;
  let resultadoFmt: string;
  let detalle: string;
  if (direccion === 'brl-pyg') {
    resultado = monto * tc;
    resultadoFmt = fmtPYG(resultado);
    detalle = `${fmtBRL(monto)} × ${tc.toLocaleString('de-DE')} = ${fmtPYG(resultado)}.`;
  } else {
    resultado = monto / tc;
    resultadoFmt = fmtBRL(resultado);
    detalle = `${fmtPYG(monto)} ÷ ${tc.toLocaleString('de-DE')} = ${fmtBRL(resultado)}.`;
  }

  // Tabla de referencia con montos típicos de compra en frontera
  const _table = {
    title: `Reales a guaraníes (TC ${tc.toLocaleString('de-DE')})`,
    headers: ['Reales (BRL)', 'Guaraníes (PYG)'],
    rows: [
      ['R$ 1', fmtPYG(1 * tc)],
      ['R$ 10', fmtPYG(10 * tc)],
      ['R$ 50', fmtPYG(50 * tc)],
      ['R$ 100', fmtPYG(100 * tc)],
      ['R$ 500', fmtPYG(500 * tc)],
      ['R$ 1.000', fmtPYG(1000 * tc)],
    ],
    note: `Cotización referencial BCP al ${TIPO_CAMBIO_PY.asOf}. En las casas de cambio de la frontera el valor de compra/venta tiene un spread propio.`,
  };

  const _insight = {
    type: 'highlight',
    icon: '🇧🇷',
    text:
      direccion === 'brl-pyg'
        ? `**${fmtBRL(monto)}** equivalen a **${fmtPYG(resultado)}** a la cotización de referencia del BCP (1 BRL = ${tc.toLocaleString('de-DE')} Gs.).`
        : `**${fmtPYG(monto)}** equivalen a **${fmtBRL(resultado)}** a la cotización de referencia del BCP (1 BRL = ${tc.toLocaleString('de-DE')} Gs.).`,
  };

  return {
    resultado: resultadoFmt,
    cotizacion: `1 BRL = ${fmtPYG(tc)}`,
    detalle,
    _table,
    _insight,
  };
}
