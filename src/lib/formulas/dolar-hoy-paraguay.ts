/**
 * Dólar hoy Paraguay — cotización Guaraní (USD ↔ PYG).
 * Cotización de referencia del BCP. La tasa NO se hardcodea: viene de
 * TIPO_CAMBIO_PY.usdPyg. Es la conversión cambiaria más buscada del país.
 */
import { TIPO_CAMBIO_PY, fmtPYG } from '../data/paraguay-2026.ts';

export interface Inputs {
  monto?: number;
  direccion?: string;   // 'usd-pyg' (dólares → guaraníes) | 'pyg-usd' (guaraníes → dólares)
}

export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

function fmtUSD(n: number): string {
  return 'US$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function dolarHoyParaguay(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const direccion = String(i.direccion || 'usd-pyg') === 'pyg-usd' ? 'pyg-usd' : 'usd-pyg';
  if (monto <= 0) throw new Error('Ingresá el monto a convertir');

  const tc = TIPO_CAMBIO_PY.usdPyg; // 1 USD = X Gs.

  let resultado: number;
  let resultadoFmt: string;
  let detalle: string;
  if (direccion === 'usd-pyg') {
    resultado = monto * tc;
    resultadoFmt = fmtPYG(resultado);
    detalle = `${fmtUSD(monto)} × ${tc.toLocaleString('de-DE', { minimumFractionDigits: 2 })} = ${fmtPYG(resultado)}.`;
  } else {
    resultado = monto / tc;
    resultadoFmt = fmtUSD(resultado);
    detalle = `${fmtPYG(monto)} ÷ ${tc.toLocaleString('de-DE', { minimumFractionDigits: 2 })} = ${fmtUSD(resultado)}.`;
  }

  const _table = {
    title: `Dólar hoy en guaraníes (TC ${tc.toLocaleString('de-DE', { minimumFractionDigits: 2 })})`,
    headers: ['Dólares (USD)', 'Guaraníes (PYG)'],
    rows: [
      ['US$ 1', fmtPYG(1 * tc)],
      ['US$ 10', fmtPYG(10 * tc)],
      ['US$ 50', fmtPYG(50 * tc)],
      ['US$ 100', fmtPYG(100 * tc)],
      ['US$ 500', fmtPYG(500 * tc)],
      ['US$ 1.000', fmtPYG(1000 * tc)],
    ],
    note: `Cotización referencial del BCP al ${TIPO_CAMBIO_PY.asOf}. Las casas de cambio y bancos manejan precios de compra y venta con un spread propio que se aparta de esta referencia.`,
  };

  const _insight = {
    type: 'highlight',
    icon: '💵',
    text:
      direccion === 'usd-pyg'
        ? `**${fmtUSD(monto)}** equivalen a **${fmtPYG(resultado)}** a la cotización de referencia del BCP de hoy (1 USD = ${tc.toLocaleString('de-DE', { minimumFractionDigits: 2 })} Gs., al ${TIPO_CAMBIO_PY.asOf}).`
        : `**${fmtPYG(monto)}** equivalen a **${fmtUSD(resultado)}** a la cotización de referencia del BCP de hoy (1 USD = ${tc.toLocaleString('de-DE', { minimumFractionDigits: 2 })} Gs., al ${TIPO_CAMBIO_PY.asOf}).`,
  };

  return {
    resultado: resultadoFmt,
    cotizacion: `1 USD = ${fmtPYG(tc)}`,
    fecha: TIPO_CAMBIO_PY.asOf,
    detalle,
    _table,
    _insight,
  };
}
